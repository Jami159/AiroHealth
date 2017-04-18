#ifndef HRV_H
#define HRV_H

// reading a text file
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <iterator>
#include <algorithm>
#include <sstream>
#include <ctime>
#include <list>
#include <cmath>
#include <functional>

const float DATARATE = 100.0;
const float MIN_BPM = 40.0;
const float MAX_BPM = 210.0;
const int MAX_PERIOD = (int)(60.0 / MIN_BPM * DATARATE);
const int MIN_PERIOD = (int)(60.0 / MAX_BPM * DATARATE)/2*2; // trunc to nearest even num
const float PEAK_THRES = 1.6e-5;//10000000.0;
const float RATIO_THRES = 1.5;

class Beat
{
public:
  int index;
  int period;
  bool valid;
  double peak;
};

class Beat2
{
public:
  time_t time;
  double period;
};

class HR_Engine
{
  std::vector<time_t> time_index;
  
  double hpf_in1;
  double hpf_in2;
  double hpf_out1;
  double hpf_out2;
  
  double lpf_in1;
  double lpf_in2;
  double lpf_out1;
  double lpf_out2;
  
  std::vector<double> pma_in;
  
  std::vector<double> xcor_in;
  std::vector<double> xcor_out;
  std::vector<double> xcor_temp;
  
  int last_beat;
  //beat_stream;
  int last_period;
  std::vector<Beat> beats;
  bool hr_valid;
  
  int count;
  int A_max_i;
  int B_max_i;
  std::vector<double> HR_stream;
  int HR_period;
  
  std::list<Beat2> postfilterQueue;
  int BeatsToRemove;
  
  void UpdateXcorTemp();
  
  void MarkBeat(int, double);
  
  Beat2 PostFilter(Beat2);
  
public:
  std::function<void (const time_t&, const double&)> new_beat_callback;
  
  HR_Engine();
  
  std::tuple<int, double, double> newSample(double, time_t);
};

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
