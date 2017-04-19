package com.airohealth;

import com.facebook.react.ReactActivity;
<<<<<<< HEAD
import android.content.Intent;
=======
>>>>>>> fork/master

import android.content.Intent;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "AiroHealth";
    }
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/master

    @Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
	    super.onActivityResult(requestCode, resultCode, data);
	    MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
	}

    @Override
    public void onBackPressed() {
        moveTaskToBack(true);
    }
<<<<<<< HEAD
=======
>>>>>>> fork/master
=======
>>>>>>> origin/master
}
