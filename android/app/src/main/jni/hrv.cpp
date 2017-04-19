#include "hrv.h"


double qz_filt[] = {
         3.93756113e-03,  -1.17613274e-02,  -5.53591433e-02,
        -1.20491126e-01,  -2.01465053e-01,  -2.93211267e-01,
        -3.91220526e-01,  -4.91474107e-01,  -5.90370256e-01,
        -6.84650804e-01,  -7.71331603e-01,  -8.47640379e-01,
        -9.10965711e-01,  -9.58821081e-01,  -9.88828357e-01,
        -9.98725767e-01,  -9.86406290e-01,  -9.49993689e-01,
        -8.87965081e-01,  -7.99331177e-01,  -6.83888280e-01,
        -5.42560053e-01,  -3.77852247e-01,  -1.94450439e-01,
        -1.11022302e-16,   1.94450439e-01,   3.77852247e-01,
         5.42560053e-01,   6.83888280e-01,   7.99331177e-01,
         8.87965081e-01,   9.49993689e-01,   9.86406290e-01,
         9.98725767e-01,   9.88828357e-01,   9.58821081e-01,
         9.10965711e-01,   8.47640379e-01,   7.71331603e-01,
         6.84650804e-01,   5.90370256e-01,   4.91474107e-01,
         3.91220526e-01,   2.93211267e-01,   2.01465053e-01,
         1.20491126e-01,   5.53591433e-02,   1.17613274e-02,
        -3.93756113e-03
};



HR_Engine::HR_Engine()
{
    i = -1;
    
    xcor_out_old = std::numeric_limits<double>::quiet_NaN();
    diff1_sign_old = std::numeric_limits<double>::quiet_NaN();
    
    previous_beat_index = std::numeric_limits<double>::quiet_NaN();
    
    total_count = 0;
    pass_count = 0;
    
    x1 = 0;
    y1 = 0; // conflicts with a global name
}


double HR_Engine::sign(double x)
{
    if (x >= 0.)
        return 1.0;
    else
        return -1.0;
}


std::tuple<double, double, double, double> HR_Engine::newSample(time_t sample_time, double ppg)
{
    double hpf_out;
    double x, y;
    double xcor_out;
    bool beat_detected;
    bool pass_flag;

    
    i++;
    
    //std::cout << "Apply hpf...\n";
    x = ppg;

    y = x - x1 + y1 - (y1 / (2<<(5-1)));
    x1 = x;
    y1 = y;

    hpf_out = y;

    
    //std::cout << "Apply rolling mean..\n";
    int window_size = 5;
    
    selected.push_front(hpf_out);
    
    if (selected.size() > window_size)
        selected.pop_back();
    
    if (selected.size() < window_size)
        rolling_mean_out.push_back(  std::numeric_limits<double>::quiet_NaN() );
    else
    {
        double sum = 0;
        int j;
        for (j=0; j < window_size; j++)
            sum += selected.at(j);
        
        rolling_mean_out.push_back( sum / window_size );
    }
    
    
    //std::cout << "Apply correlation with QZ template..\n";
    double xcor = 0;
    int lt = sizeof(qz_filt) / sizeof(double);//qz_filt.size();
    int li = i;//rolling_mean_out.size();
    int length = (lt < li) ? lt : li;
    //do the Xcor calc
    for (int j = 0; j < length; j++) {
        int nt = lt - j - 1;
        int ni = li - j - 1;
        xcor += qz_filt[nt] * rolling_mean_out[ni];
    }
    xcor_out = xcor;
    
    // avoid "memory leak"
    if (rolling_mean_out.size() > 1000)
    {
        //std::cout << "remove first 500\n";
        std::vector<double> new_rolling_mean_out;
        for (std::vector<double>::iterator it = rolling_mean_out.begin()+500; it != rolling_mean_out.end(); it++)
            new_rolling_mean_out.push_back( *it );
        
        i -= 500;
        previous_beat_index -= 500;
        rolling_mean_out = new_rolling_mean_out;
    }

    
    //std::cout << "get max points of qze - pos to neg zero crossings of difference\n";
    double diff1 = xcor_out - xcor_out_old;
    xcor_out_old = xcor_out;
    
    double diff1_sign = sign(diff1);
    
    double diff2 = diff1_sign - diff1_sign_old;
    diff1_sign_old = diff1_sign;
    
    beat_detected = diff2 < 0;

    
    //std::cout << "apply qze > 0 to filter qze max points (reject obvious weak maxima)\n";
    beat_detected = beat_detected & (xcor_out > 0 );
    
    
    if (beat_detected)
    {
        // Calculate beat period
        beats_period.push_back( (i - previous_beat_index)/100.0 );
        beats_time.push_back( sample_time );
        previous_beat_index = i;
        
        // Apply ratio filter and absolute filter, for the 2nd last beat
        if (beats_period.size() >= 3)
        {
            double period_end0 = *(--beats_period.end());
            double period_end1 = *(--(--beats_period.end()));
            double period_end2 = *(--(--(--beats_period.end())));
            
            double behind_ratio = period_end1 / period_end2;
            double ahead_ratio = period_end1 / period_end0;
            double period = period_end1;
            
            bool ratio_pass = (behind_ratio > 0.8) & (behind_ratio < 1.2) & (ahead_ratio > 0.8) & (ahead_ratio < 1.2);
            bool absolute_pass = (period >= 0.45) & (period <= 2.0);
        
            pass_flag = ratio_pass & absolute_pass;
            
            
            //std::cout << period << "," << behind_ratio << "," << ahead_ratio << "," << pass_flag << "\n";
            total_count++;
            if (pass_flag)
            {
                pass_count++;
                time_t time_end1 = *(--(--beats_time.end()));
                new_beat_callback(time_end1, period);
            }
            
        }
        
        if (beats_period.size() > 3)
        {
            beats_period.pop_front();
            beats_time.pop_front();
        }
    }

    return std::make_tuple( hpf_out, rolling_mean_out.at(i), xcor_out, beat_detected );
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

double HRV_Engine::SDCalc(time_t date, double RRValue)
{
  double timeDiff = difftime(date, oldRRValueDate);
  double successiveDiff;
  if (RRValue > 0.0 && oldRRValue > 0.0 && timeDiff < WINDOW_PERIOD) {
    successiveDiff = RRValue - oldRRValue;
    //std::cout << "sd: " << successiveDiff << " abs sd: " << abs(successiveDiff) << " std::abs sd " << std::abs(successiveDiff) << "\n";
    //if (abs(successiveDiff) > 0.2) {
    if (std::abs(successiveDiff) > 0.2) {
      successiveDiff = -1.0;
    }
  } else {
    successiveDiff = -1.0;
  }

  oldRRValue = RRValue;
  oldRRValueDate = date;

  return successiveDiff;
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
