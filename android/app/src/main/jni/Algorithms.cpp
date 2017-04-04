#include <android/log.h>
#include "Algorithms.h"
#include "hrv.h"
#include "steps.h"
#include <vector>
#include <stdlib.h>

#define LOG_TAG "jni_Algorithms"

#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static const std::vector<std::array<double, 2> > vec_zero;

//HRV algorithm

void new_beat(time_t, double);

HRV_Engine hrv_engine;
std::vector<std::array<double, 2> > stressVals;
int hrvCount = 0;

HR_Engine hr_engine;

void new_beat(time_t time, double period) {
	double RMSSD = hrv_engine.newHeartBeat(time, period);
	double t = static_cast<double>(time);

	if (RMSSD >= 0) {
		std::array<double, 2> one_beat = {t, RMSSD};
		stressVals.push_back(one_beat);
		hrvCount++;
	}
}

JNIEXPORT jobjectArray JNICALL Java_com_airohealth_AlgorithmsModule_getStressJNI(JNIEnv *env, jobject thiz, jobjectArray ppgData) {

	jsize OuterDim = ppgData? env->GetArrayLength(ppgData) : 0;
	std::vector<std::vector<double> > result(OuterDim);

	for (jsize i = 0; i < OuterDim; i++) {
		jdoubleArray inner = static_cast<jdoubleArray>(env->GetObjectArrayElement(ppgData, i));

		if (inner) {
			jsize InnerDim = env->GetArrayLength(inner);
			result[i].resize(InnerDim);

			jdouble *data = env->GetDoubleArrayElements(inner, NULL);
			std::copy(data, data + InnerDim, result[i].begin());
			env->ReleaseDoubleArrayElements(inner, data, JNI_ABORT);
			env->DeleteLocalRef(inner);
		}
	}

	hr_engine.new_beat_callback = new_beat;

	for (int i = 0; i < OuterDim; i++) {
		double start_time = result[i][0];
		double ppg = result[i][1];

		hr_engine.newSample(ppg * (-1), start_time);
	}

	OuterDim = hrvCount;

	double stressArr[OuterDim][2];

	for (int i = 0; i < OuterDim; i++) {
		for (int j = 0; j < 2; j++) {
			stressArr[i][j] = stressVals[i][j];
		}
	}

	jdoubleArray inside = env->NewDoubleArray(2);

	jobjectArray outside = env->NewObjectArray(OuterDim, env->GetObjectClass(inside), 0); //0 ? NULL

	std::vector<jdouble> buffer;

	for (std::size_t i = 0; i < OuterDim; i++) {
		buffer.assign(stressArr[i], stressArr[i] + 2);

		env->SetDoubleArrayRegion(inside, 0, 2, &buffer[0]); //0 ? NULL

		env->SetObjectArrayElement(outside, i, inside);

		if (i + 1 != OuterDim) {
			inside = env->NewDoubleArray(2);
		}
	}

	stressVals = vec_zero;
	hrvCount = 0;

	return outside;
}