package com.airohealth;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.rnziparchive.RNZipArchivePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.imagepicker.ImagePickerPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.amazonaws.reactnative.s3.AWSRNTransferUtilityPackage;
import com.amazonaws.reactnative.sns.AWSRNSNSPackage;
import com.amazonaws.reactnative.lambda.AWSRNLambdaPackage;
import com.amazonaws.reactnative.dynamodb.AWSRNDynamoDBPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.amazonaws.reactnative.core.AWSRNCorePackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.facebook.FacebookSdk;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;

import java.util.Arrays;
import java.util.List;

import it.innove.BleManagerPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new RNZipArchivePackage(),
            new RNFetchBlobPackage(),
            new ImagePickerPackage(),
            new ReactNativePushNotificationPackage(),
            new AWSRNTransferUtilityPackage(),
            new AWSRNSNSPackage(),
            new AWSRNLambdaPackage(),
            new AWSRNDynamoDBPackage(),
            new FBSDKPackage(mCallbackManager),
            new AWSRNCorePackage(),
            new MyReactPackage(),
            new BleManagerPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }
}
