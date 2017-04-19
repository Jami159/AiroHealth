//
//  Algorithms.mm
//  AiroHealth
//
//  Created by Al-Jami Ismail on 2017-04-03.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Algorithms.h"
#import "hrv.h"
#import "steps.h"

@implementation Algorithms

RCT_EXPORT_MODULE();

//HRV algorithm

void new_beat(time_t, double);

HRV_Engine hrv_engine;
NSMutableArray *stressVals = [NSMutableArray array];

HR_Engine hr_engine;

void new_beat(time_t time, double period) {
  double RMSSD = hrv_engine.newHeartBeat(time, period);
  double t = static_cast<double>(time);
  
  if (RMSSD >= 0) {
    NSMutableArray *one_beat = [NSMutableArray array];
    [one_beat addObject:[NSNumber numberWithDouble:t]];
    [one_beat addObject:[NSNumber numberWithDouble:RMSSD]];
    [stressVals addObject:one_beat];
  }
}

RCT_REMAP_METHOD(getStress,
                 ppgData:(NSArray *)ppgData
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  
  [stressVals removeAllObjects];
  
  hr_engine.new_beat_callback = new_beat;
  
  for (NSArray *arr in ppgData) {
    double start_time = [[arr objectAtIndex:0] doubleValue];
    double ppg = [[arr objectAtIndex:1] doubleValue];
    
    hr_engine.newSample(start_time, ppg * (-1));
  }
  
  if (stressVals) {
    resolve(stressVals);
  } else {
    NSError *error = [NSError errorWithDomain:@"com.AiroHealth.app" code:0 userInfo:@{@"Error reason": @"Something happened"}];
    reject(@"no_values", @"There were no values", error);
  }
}

//Steps algorithm

void new_step(time_t, double);

NSMutableArray *stepsVals = [NSMutableArray array];

Steps_Engine steps_engine;

void new_step(time_t time, double period) {
  double t = static_cast<double>(time);
  
  NSMutableArray *one_step = [NSMutableArray array];
  [one_step addObject:[NSNumber numberWithDouble:t]];
  [one_step addObject:[NSNumber numberWithDouble:period]];
  [stepsVals addObject:one_step];
}

RCT_REMAP_METHOD(getSteps,
                 acclData:(NSArray *)acclData
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  
  [stepsVals removeAllObjects];
  
  steps_engine.new_step_callback = new_step;
  
  for (NSArray *arr in acclData) {
    double start_time = [[arr objectAtIndex:0] doubleValue];
    double accelX = [[arr objectAtIndex:1] doubleValue] / 4096.;
    double accelY = [[arr objectAtIndex:2] doubleValue] / 4096.;
    double accelZ = [[arr objectAtIndex:3] doubleValue] / 4096.;
    
    steps_engine.newSample(start_time, accelX, accelY, accelZ);
  }
  
  if (stepsVals) {
    resolve(stepsVals);
  } else {
    NSError *error = [NSError errorWithDomain:@"com.AiroHealth.app" code:0 userInfo:@{@"Error reason": @"Something happened"}];
    reject(@"no_values", @"There were no values", error);
  }
}

@end
