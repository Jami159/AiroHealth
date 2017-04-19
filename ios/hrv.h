#ifndef HRV_H
#define HRV_H


#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <iterator>

#include <deque>
#include <limits>
#include <cmath>
#include <algorithm>

#include <list>
//#include <ctime>

#include <functional>


class HR_Engine
{
  int i;
  
  double x1;
  double y1; // conflicts with a global name
  
  std::vector<double> rolling_mean_out;
  
  std::deque<double> selected;
  
  double xcor_out_old;
  double diff1_sign_old;
  
  std::list<double> beats_period;
  std::list<time_t> beats_time;
  double previous_beat_index;
  
  double sign(double);
  
public:
  std::function<void (const time_t&, const double&)> new_beat_callback;
  
  HR_Engine();
  
  std::tuple<double, double, double, double> newSample(time_t, double);
  
  int total_count;
  int pass_count;
};


// HRV

class Sample
{
public:
  double value;
  time_t date;
};


class HRV_Engine
{
  const double WINDOW_PERIOD = 30.0;
  
  double oldRRValue;
  time_t oldRRValueDate;
  
  double squareSum;
  std::list<Sample> squareSDArray;
  double RMSSD;
  
public:
  HRV_Engine();
  
  double newHeartBeat(time_t, double);
  
  double SDCalc(time_t, double);
};


#endif
