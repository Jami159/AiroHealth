#include "steps.h"

Steps_Engine::Steps_Engine()
{
  sample_count = -1;
  
  sumX = 0;
  sumY = 0;
  sumZ = 0;
  
  old_i = -500; // should always be invalid for first step
  
  valid_step_count = 0;
}

std::tuple<int, double, double, double, double> Steps_Engine::newSample(time_t sample_time, double accelX, double accelY, double accelZ)
{
  sample_count++;
  time_index.push_back(sample_time);
  
  //std::cout << "Apply smoothing filter" << "\n";
  
  windowX.push_back( accelX );
  windowY.push_back( accelY );
  windowZ.push_back( accelZ );
  sumX += windowX.back();
  sumY += windowY.back();
  sumZ += windowZ.back();
  if (windowX.size() > 4) {
    sumX -= windowX.front();
    sumY -= windowY.front();
    sumZ -= windowZ.front();
    windowX.pop_front();
    windowY.pop_front();
    windowZ.pop_front();
  }
  accelX_smoothed.push_back( sumX / windowX.size() );
  accelY_smoothed.push_back( sumY / windowY.size() );
  accelZ_smoothed.push_back( sumZ / windowZ.size() );
  
  
  //std::cout << "Calculate dynamic threshold" << "\n";
  
  if (sample_count == 0)
  {
    accelX_max = accelX_smoothed.back();
    accelY_max = accelY_smoothed.back();
    accelZ_max = accelZ_smoothed.back();
    accelX_min = accelX_smoothed.back();
    accelY_min = accelY_smoothed.back();
    accelZ_min = accelZ_smoothed.back();
  }
  else if (sample_count%50 == 0)
  {
    accelX_max = *std::max_element(&accelX_smoothed.front(), &accelX_smoothed.back());
    accelY_max = *std::max_element(&accelY_smoothed.front(), &accelY_smoothed.back());
    accelZ_max = *std::max_element(&accelZ_smoothed.front(), &accelZ_smoothed.back());
    accelX_min = *std::min_element(&accelX_smoothed.front(), &accelX_smoothed.back());
    accelY_min = *std::min_element(&accelY_smoothed.front(), &accelY_smoothed.back());
    accelZ_min = *std::min_element(&accelZ_smoothed.front(), &accelZ_smoothed.back());
    
    double accelX_smoothed_back = accelX_smoothed.back();
    double accelY_smoothed_back = accelY_smoothed.back();
    double accelZ_smoothed_back = accelZ_smoothed.back();
    accelX_smoothed.clear();
    accelY_smoothed.clear();
    accelZ_smoothed.clear();
    accelX_smoothed.push_back(accelX_smoothed_back);
    accelY_smoothed.push_back(accelY_smoothed_back);
    accelZ_smoothed.push_back(accelZ_smoothed_back);
  }
  
  accelX_thres = (accelX_max + accelX_min)/2;
  accelY_thres = (accelY_max + accelY_min)/2;
  accelZ_thres = (accelZ_max + accelZ_min)/2;
  
  
  //std::cout << "Apply precision filter" << "\n";
  
  double precision = 0.1;//0.05//0.02
  if (sample_count == 0)
  {
    sampleX_new = accelX_smoothed.at(0);
    sampleY_new = accelY_smoothed.at(0);
    sampleZ_new = accelZ_smoothed.at(0);
  }
  
  sampleX_old = sampleX_new;
  sampleY_old = sampleY_new;
  sampleZ_old = sampleZ_new;
  if (fabs(accelX_smoothed.back() - sampleX_new) > precision)
    sampleX_new = accelX_smoothed.back();
  if (fabs(accelY_smoothed.back() - sampleY_new) > precision)
    sampleY_new = accelY_smoothed.back();
  if (fabs(accelZ_smoothed.back() - sampleZ_new) > precision)
    sampleZ_new = accelZ_smoothed.back();
  
  
  //std::cout << "Find largest acceleration axis" << "\n";
  
  accelX_amplitude = accelX_max - accelX_min;
  accelY_amplitude = accelY_max - accelY_min;
  accelZ_amplitude = accelZ_max - accelZ_min;
  
  double my_max = std::max( std::max(accelX_amplitude, accelY_amplitude), accelZ_amplitude );
  if (my_max == accelX_amplitude)
  {
    accel_old_max = sampleX_old;
    accel_new_max = sampleX_new;
    accel_thres_max = accelX_thres;
  }
  else if (my_max == accelY_amplitude)
  {
    accel_old_max = sampleY_old;
    accel_new_max = sampleY_new;
    accel_thres_max = accelY_thres;
  }
  else // accelZ_amplitude
  {
    accel_old_max = sampleZ_old;
    accel_new_max = sampleZ_new;
    accel_thres_max = accelZ_thres;
  }
  
  
  //std::cout << "Step detection" << "\n";
  
  accel_steps = (accel_old_max > accel_thres_max) & (accel_thres_max > accel_new_max);
  
  
  //std::cout << "Mark invalid steps using time window" << "\n";
  
  if (accel_steps)
  {
    steps_index.push_back(sample_count);
    steps_period.push_back(sample_count - old_i);
    old_i = sample_count;
    
    
    steps_valid.push_back( (steps_period.back() > 10) & (steps_period.back() < 100) );
    
    
    //std::cout << "Determine periodic steps using count regulation" << "\n";
    
    steps_valid2.push_back( false );
    
    if (steps_valid.back())
      valid_step_count++;
    else
      valid_step_count = 0;
    
    unsigned int i = steps_valid2.size() - 1;
    if (valid_step_count == 4)
    {
      steps_valid2.at(i-3) = true;
      steps_valid2.at(i-2) = true;
      steps_valid2.at(i-1) = true;
      steps_valid2.at(i) = true;
      
      new_step_callback( time_index[steps_index.at(i-3)], steps_period.at(i-3) );
      new_step_callback( time_index[steps_index.at(i-2)], steps_period.at(i-2) );
      new_step_callback( time_index[steps_index.at(i-1)], steps_period.at(i-1) );
      new_step_callback( time_index[steps_index.at(i)], steps_period.at(i) );
    }
    else if (valid_step_count > 4)
    {
      steps_valid2.at(i) = true;
      new_step_callback( time_index[steps_index.at(i)], steps_period.at(i) );
    }
  }
  
  return std::make_tuple( sample_count, accelX_smoothed.back(), accelX_thres, sampleX_new, accel_steps );
}
