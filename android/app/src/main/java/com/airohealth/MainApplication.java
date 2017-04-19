package com.airohealth;

import android.app.Application;
<<<<<<< HEAD
import java.util.Arrays;
import java.util.List;

import com.facebook.react.ReactApplication;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
=======
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.amazonaws.reactnative.core.AWSRNCorePackage;
import com.facebook.react.ReactInstanceManager;
>>>>>>> fork/master
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
<<<<<<< HEAD
import com.facebook.FacebookSdk;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;

import com.amazonaws.reactnative.s3.AWSRNTransferUtilityPackage;
import com.amazonaws.reactnative.sns.AWSRNSNSPackage;
import com.amazonaws.reactnative.lambda.AWSRNLambdaPackage;
import com.amazonaws.reactnative.dynamodb.AWSRNDynamoDBPackage;
import com.amazonaws.reactnative.core.AWSRNCorePackage;
import com.rnziparchive.RNZipArchivePackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import it.innove.BleManagerPackage;
import com.oblador.vectoricons.VectorIconsPackage;

=======

import java.util.Arrays;
import java.util.List;

import it.innove.BleManagerPackage;
>>>>>>> fork/master

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
<<<<<<< HEAD
          new MainReactPackage(),
            new AWSRNTransferUtilityPackage(),
            new AWSRNSNSPackage(),
            new AWSRNLambdaPackage(),
            new AWSRNDynamoDBPackage(),
            new AWSRNCorePackage(),
            new RNZipArchivePackage(),
            new ReactNativePushNotificationPackage(),
            new RNFetchBlobPackage(),
            new FBSDKPackage(mCallbackManager),
            new BleManagerPackage(),
            new VectorIconsPackage()
=======
        new MainReactPackage(),
        new AWSRNCorePackage(),
        new MyReactPackage(),
        new BleManagerPackage()
>>>>>>> fork/master
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
<<<<<<< HEAD

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }
=======
>>>>>>> fork/master
}
