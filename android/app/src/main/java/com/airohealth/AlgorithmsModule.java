package com.airohealth;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import java.util.*;

public class AlgorithmsModule extends ReactContextBaseJavaModule {
	static {
		System.loadLibrary("Algorithms_jni"); //this loads the library when the class is loaded
	}

	public AlgorithmsModule(ReactApplicationContext reactContext) {
		super(reactContext); //required by React Native
	}

	@Override
	public String getName() {
		return "Algorithms"; //Algorithms is how this module will be referred to from React Native
	}

	@ReactMethod
	public void getStress(ReadableArray ppgData, Promise promise) { //this method will be called from JS by React Native
		try {
			int outer = ppgData.size();
			int inner = ppgData.getArray(0).size();

			double[][] ppg = new double[outer][inner];

			for (int i = 0; i < outer; i++) {
				for (int j = 0; j < inner; j++) {
					ppg[i][j] = ppgData.getArray(i).getDouble(j);
				}
			}

			double[][] stressArr = getStressJNI(ppg);

			WritableArray stressVals = Arguments.createArray();

			for (double[] d : stressArr) {
				stressVals.pushArray(this.toWritableArray(d, inner));
			}

			promise.resolve(stressVals);

		} catch (Exception e) {
			promise.reject("ERR", e);
		}
	}

	@ReactMethod
	public void getSteps(ReadableArray acclData, Promise promise) { //this method will be called from JS by React Native
		try {

		} catch (Exception e) {
			promise.reject("ERR", e);
		}
	}

	public WritableArray toWritableArray(double[] arr, int size) {
		WritableArray tmp = Arguments.createArray();
		for (int i=0; i<size; i++){
			tmp.pushDouble(arr[i]);
		}
		return tmp;
	}

	public native double[][] getStressJNI(double[][] arr);

	public native double[][] getStepsJNI(double[][] arr);
}