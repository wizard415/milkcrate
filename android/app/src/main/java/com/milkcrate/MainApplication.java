package com.milkcrate;

import android.app.Activity;
import android.app.Application;
import android.util.Log;

import com.crashlytics.android.Crashlytics;
import com.facebook.react.ReactApplication;
import com.kevinejohn.RNMixpanel.RNMixpanel;
import com.github.yamill.orientation.OrientationPackage;
import com.marianhello.react.BackgroundGeolocationPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.horcrux.svg.SvgPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.brentvatne.react.ReactVideoPackage;
import com.joshblour.reactnativepermissions.ReactNativePermissionsPackage;
import com.smixx.fabric.FabricPackage;
import com.calendarevents.CalendarEventsPackage;
import com.chirag.RNMail.RNMail;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.microsoft.codepush.react.CodePush;
import com.imagepicker.ImagePickerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import io.fabric.sdk.android.Fabric;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNMixpanel(),
            new OrientationPackage(),
            new BackgroundGeolocationPackage(),
            new ReactNativePushNotificationPackage(),
            new SvgPackage(),
            new RNDeviceInfo(),
            new ReactVideoPackage(),
            new ReactNativePermissionsPackage(),
            new FabricPackage(),
            new CalendarEventsPackage(),
            new RNMail(),
            new RNFetchBlobPackage(),
            new MapsPackage(),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG),
            new ImagePickerPackage(),
            new VectorIconsPackage()
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
    Fabric.with(this, new Crashlytics());
    SoLoader.init(this, /* native exopackage */ false);
  }
}
