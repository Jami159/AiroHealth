#ifndef STEPS_H
#define STEPS_H

#include <iostream>
#include <fstream>
//#include <string>
#include <vector>
#include <iterator>
#include <algorithm>
#include <sstream>
#include <ctime>
//#include <list>
#include <cmath>
#include <deque>

#include <functional>


class Steps_Engine
{
  int sample_count;
  std::vector<time_t> time_index;
  
  std::deque<double> windowX, windowY, windowZ;
  std::vector<double> accelX_smoothed, accelY_smoothed, accelZ_smoothed;
  double sumX, sumY, sumZ;
  
  double accelX_max, accelY_max, accelZ_max;
  double accelX_min, accelY_min, accelZ_min;
  double accelX_thres, accelY_thres, accelZ_thres;
  
  double sampleX_new, sampleY_new, sampleZ_new;
  double sampleX_old, sampleY_old, sampleZ_old;
  
  double accel_old_max;
  double accel_new_max;
  double accel_thres_max;
  double accelX_amplitude, accelY_amplitude, accelZ_amplitude;
  
  bool accel_steps;
  //public:
  std::vector<int> steps_index;
  std::vector<double> steps_period;
  double old_i;
  
  std::vector<bool> steps_valid;
  
  std::vector<bool> steps_valid2;
  int valid_step_count;
  
public:
  Steps_Engine();
  std::tuple<int, double, double, double, double> newSample(time_t, double, double, double);
  std::function<void (const time_t&, const double&)> new_step_callback;
};

#endif
