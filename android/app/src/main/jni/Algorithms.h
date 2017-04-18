#include <jni.h>

#ifndef _Included_Algorithms
#define _Included_Algorithms
#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobjectArray JNICALL Java_com_airohealth_AlgorithmsModule_getStressJNI(JNIEnv *, jobject, jobjectArray);

JNIEXPORT jobjectArray JNICALL Java_com_airohealth_AlgorithmsModule_getStepsJNI(JNIEnv *, jobject, jobjectArray);

#ifdef __cplusplus
}
#endif
#endif