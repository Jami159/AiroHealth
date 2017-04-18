#include "hrv.h"

void HR_Engine::UpdateXcorTemp()
{
  if (last_beat >= MAX_PERIOD) {
    xcor_temp.clear();
    
    int xcor_len = MAX_PERIOD;
    for (int i = 0; i < xcor_len; i++) {
      xcor_temp.push_back( xcor_in[last_beat - i] );
    }
  }
}

void HR_Engine::MarkBeat(int index, double peak)
{
  last_period = index - last_beat;
  last_beat = index;
  
  Beat beat;
  beat.index = last_beat;
  beat.period = last_period;
  beat.valid = false;
  beat.peak = peak;
  
  beats.push_back(beat);
}

Beat2 HR_Engine::PostFilter(Beat2 beat)
{
  /* When a bad beat is detected, this will eliminate the neighboring 2 beats on each side. These "edge beats" have proven to be erroneous. This uses a queue. */
  
  const int PRE_REJECT_BEATS = 2; //before bad beat occurs
  const int POST_REJECT_BEATS = 3; //after bad beat occurs
  
  postfilterQueue.push_front(beat);
  
  if (BeatsToRemove > 0 && postfilterQueue.size() > 0) {
    postfilterQueue.pop_front();
    BeatsToRemove --;
  }
  
  if (beat.period < 0) { // bad period occurred
    // remove current beat and previous x beats
    postfilterQueue.clear();
    // remove future y beats
    BeatsToRemove = POST_REJECT_BEATS;
    
    beat.period = -1.0;
    return beat;
  }
  else if (postfilterQueue.size() > PRE_REJECT_BEATS)
  {
    Beat2 out_beat = postfilterQueue.back();
    postfilterQueue.pop_back();
    
    return out_beat;
  }
  
  beat.period = -1.0;
  return beat;
}

HR_Engine::HR_Engine()
{
  //time_index;
  
  hpf_in1 = 0;
  hpf_in2 = 0;
  hpf_out1 = 0;
  hpf_out2 = 0;
  
  lpf_in1 = 0;
  lpf_in2 = 0;
  lpf_out1 = 0;
  lpf_out2 = 0;
  
  //pma_in;
  
  //xcor_in;
  //xcor_out;
  //xcor_temp;
  
  last_beat = 0;
  //beat_stream;
  last_period = MAX_PERIOD;
  //beats;
  hr_valid = false;
  
  count = 0;
  A_max_i = 0;
  B_max_i = 0;
  //HR_stream = [NSMutableArray array];
  HR_period = 0;
  
  //postfilterQueue;
  BeatsToRemove = 0;
}

std::tuple<int, double, double> HR_Engine::newSample(double in_sample, time_t sample_time)
{
  time_index.push_back(sample_time);
  
  //HPF: Buterworth, 2nd order, fc = 0.5 Hz
  double hpf_in = in_sample;
  double hpf_out = hpf_in2 - 2*hpf_in1 + hpf_in - 0.9149758348*hpf_out2 + 1.9111970674*hpf_out1;
  hpf_in2 = hpf_in1;
  hpf_in1 = hpf_in;
  hpf_out2 = hpf_out1;
  hpf_out1 = hpf_out;
  
  //LPF: Buterworth, 2nd order, fc = 3 Hz
  double lpf_in = hpf_out/35.89405581;
  double lpf_out = lpf_in2 + 2*lpf_in1 + lpf_in - 0.5869195081*lpf_out2 + 1.4754804436*lpf_out1;
  lpf_in2 = lpf_in1;
  lpf_in1 = lpf_in;
  lpf_out2 = lpf_out1;
  lpf_out1 = lpf_out;
  
  //PMA
  pma_in.push_back(lpf_out);
  
  //update PMA and XcorTemp at 1/2 through new period
  count = pma_in.size() - 1;
  if ((count - last_beat) == (int)(last_period/2)) {
    int my_beats[3];
    if (beats.size() >= 3) {
      int beats_end = beats.size() - 1;
      my_beats[2] = beats[beats_end].period;
      my_beats[1] = beats[beats_end - 1].period;
      my_beats[0] = beats[beats_end - 2].period;
      
      //check validity
      bool hr_valid_old = hr_valid;
      hr_valid = false;
      if (my_beats[0] > 0 && my_beats[1] > 0 && my_beats[2] > 0) {
        int my_min = *std::max_element(my_beats, my_beats+3);
        int my_max = *std::max_element(my_beats, my_beats+3);
        if (((double)my_max / my_min) < RATIO_THRES && my_beats[2] >= MIN_PERIOD && my_beats[2] <= MAX_PERIOD) {
          hr_valid = true;
          HR_period = my_beats[2]; //use last period for HR calc
          UpdateXcorTemp();
          
          //mark last beat as valid
          beats.back().valid = true;
          
          double my_period = beats.back().period / DATARATE;
          
          Beat2 out_beat;
          Beat2 beat2;
          beat2.time = time_index[count];
          
          if (hr_valid_old == false) {
            //indicate a resume of beats
            std::cout << "Resume\n";
            
            beat2.period = -1.0;
            out_beat = PostFilter(beat2);
            new_beat_callback(out_beat.time, out_beat.period);
          }
          beat2.period = my_period;
          out_beat = PostFilter(beat2);
          new_beat_callback(out_beat.time, out_beat.period);
        }
      }
    }
  }
  
  if (hr_valid == true) {
    double hr_value = (double)DATARATE/HR_period*60;
    HR_stream.push_back(hr_value);
  } else {
    HR_stream.push_back(0.0);
  }
  
  //reset PMA mode and Xcor Template on timeout
  if ((count - last_beat) >= 2*MAX_PERIOD) { //can have N * last_valid_period
    hr_valid = false;
    MarkBeat(count - 1, 0.0);
    UpdateXcorTemp();
  }
  
  //calc PMA
  double pma = pma_in.back();
  int avg_len = 1;
  if (hr_valid == true) {
    pma += pma_in[count - HR_period];
    pma += pma_in[count - HR_period*2];
    avg_len = 3;
  }
  double pma_out = (double)(pma) / avg_len;
  
  xcor_in.push_back( pma_out );
  double xcor = 0;
  int lt = xcor_temp.size();
  int li = xcor_in.size();
  int length = (lt < li) ? lt : li;
  //do the Xcor calc
  for (int i = 0; i < length; i++) {
    int nt = lt - i - 1;
    int ni = li - i - 1;
    xcor += xcor_temp[nt] * xcor_in[ni];
  }
  xcor_out.push_back(xcor);
  
  //Trig - overlapping tiled window method
  
  if (count >= MIN_PERIOD) {
    //tiled window A
    if (count % MIN_PERIOD == 0) {
      std::vector<double>::iterator max_num = std::max_element(xcor_out.end() - MIN_PERIOD, xcor_out.end());
      A_max_i = std::distance( xcor_out.begin(), max_num );
      double max_num_val = *max_num;
      //check against window B
      if (A_max_i == B_max_i && max_num_val > PEAK_THRES) {
        MarkBeat(A_max_i, max_num_val);
      }
    }
    
    //tiled window B
    if ((count + MIN_PERIOD/2) % MIN_PERIOD == 0) {
      std::vector<double>::iterator max_num = std::max_element(xcor_out.end() - MIN_PERIOD, xcor_out.end());
      B_max_i = std::distance( xcor_out.begin(), max_num );
      double max_num_val = *max_num;
      //check against window B
      if (B_max_i == A_max_i && max_num_val > PEAK_THRES) {
        MarkBeat(B_max_i, max_num_val);
      }
    }
  }
  
  return std::make_tuple( count, lpf_out, xcor_out.back() );
  //  return xcor_out.back();
}

//HRV

HRV_Engine::HRV_Engine()
{
  oldRRValue = -1.0;
  oldRRValueDate = time(0);
  
  squareSum = 0.0;
  //squareSDArray;
  RMSSD = 0.0;
}

double HRV_Engine::newHeartBeat(time_t date, double RRValue)
{
  //time_t date = time(0);
  double successiveDiff = SDCalc(date, RRValue);
  
  if (successiveDiff < -0.99) {
    return -1.0;
  }
  
  double square = successiveDiff*successiveDiff;
  squareSum += square;
  Sample sample;
  sample.value = square;
  sample.date = date;
  squareSDArray.push_back(sample);
  
  //Remove samples that are too old, from both array and sum
  double howOld = difftime(date, squareSDArray.front().date);
  while (howOld > WINDOW_PERIOD) {
    squareSum -= squareSDArray.front().value;
    squareSDArray.pop_front();
    
    howOld = difftime(date, squareSDArray.front().date);
  }
  
  //Account for float rounding errors
  if (squareSum < 0.0) {
    squareSum = 0.0;
  }
  
  //Get SQRT of mean
  if (squareSDArray.size() > 0) {
    double mean = squareSum / squareSDArray.size();
    RMSSD = std::sqrt(mean);
  } else {
    RMSSD = -1.0;
  }
  
  return RMSSD;
}

double HRV_Engine::SDCalc(time_t date, double RRValue)
{
  double timeDiff = difftime(date, oldRRValueDate);
  double successiveDiff;
  if (RRValue > 0.0 && oldRRValue > 0.0 && timeDiff < WINDOW_PERIOD) {
    successiveDiff = RRValue - oldRRValue;
    if (abs(successiveDiff) > 0.2) {
      successiveDiff = -1.0;
    }
  } else {
    successiveDiff = -1.0;
  }
  
  oldRRValue = RRValue;
  oldRRValueDate = date;
  
  return successiveDiff;  
}
