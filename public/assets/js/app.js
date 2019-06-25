//import { loadavg } from "os";
var database, auth, messaging, storage, ui, user;
var vendors_ref, customers_ref, payments_ref;

var vendors = {}; 
var customers = {};
var payments = {};

var libs = ['firebase-app.js','firebase-auth.js','firebase-database.js','firebase-firestore.js',
'firebase-messaging.js', 'firebase-storage.js', 'firebaseui.js'];

window.prepare_firebase = function(){
  firebase.initializeApp({
    "apiKey": "AIzaSyCYLDTKAfXBgAdF6hqF3qsSYo1o-2WHo7s",
    "databaseURL": "https://payahead-80360.firebaseio.com",
    "storageBucket": "payahead-80360.appspot.com",
    "authDomain": "payahead-80360.firebaseapp.com",
    "messagingSenderId": "392417005472",
    "projectId": "payahead-80360"
  });

  window.ui = new firebaseui.auth.AuthUI(firebase.auth());
  window.uiConfig = prepare_uiConfig();
  window.ui.disableAutoSignIn();
  window.database = firebase.database();
  window.auth = firebase.auth();
  window.messaging = firebase.messaging();
  window.storage = firebase.storage();

  window.vendors_ref = database.ref('/vendors/');
  window.customers_ref = database.ref('/customers/');
  window.payments_ref = database.ref('/payments/');

  window.auth.onAuthStateChanged(authstateobserver);
  document.getElementById('firebaseui-auth-container').innerHTML = "";
  window.ui.start('#firebaseui-auth-container', window.uiConfig);
}

function prepare_uiConfig(){
  return {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        if (authResult.user) {
          window.user = JSON.parse(JSON.stringify(authResult.user));
          window.actionCodeSettings = {
              url: 'https://loadbuddy.web.app/?email=' + window.user.email,
              //iOS: {
                //bundleId: 'com.example.ios'
              //},
              //android: {
                //packageName: 'com.example.android',
                //installApp: true,
                //minimumVersion: '12'
              //},
              handleCodeInApp: false//,
              //dynamicLinkDomain: "loadbuddy.web.app"
            };
          if(user.emailVerified){
            
            //handleSignedInUser(authResult.user);
          }else{
            if(authResult.additionalUserInfo.isNewUser){
              /*auth.currentUser.sendEmailVerification(window.actionCodeSettings).then(
                function() {
                    // Email sent.
                    document.getElementById('firebaseui-auth-container').innerHTML = "A verification link has been sent to your email";
                }, function(error) {
                    // An error happened.
                }
              );*/
            }else{
              //document.getElementById('firebaseui-auth-container').innerHTML = "A verification link has been sent to your email";
            }
            
          }
        }
        /*if (authResult.additionalUserInfo) {
          //True for new users otherwise false
          //authResult.additionalUserInfo.isNewUser
        }*/
        return false;
      },
      uiShown: function() {
        // The widget is rendered. Hide the loader.
        //document.getElementById('loader').style.display = 'none';
      }
    },
    credentialHelper : firebaseui.auth.CredentialHelper.NONE,
    signInFlow: 'popup',
    signInOptions: [
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID
      }
    ]
  }
}

var initApp = function() {
  prepare_dependencies();
};

function prepare_dependencies(){
  var scriptElements = document.getElementsByTagName('script');
  var firstsource = scriptElements[0].src;
  var folder = firstsource.substring(document.URL.substring(0, document.URL.lastIndexOf("/")+1).length, firstsource.lastIndexOf("/")+1);
  
  for(i=0; i<libs.length; i++){
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", folder+libs[i]);
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  setTimeout(window.prepare_firebase, 1000);

  /*08033953050
  08085221450*/
}

window.addEventListener('load', initApp);

document.addEventListener('DOMContentLoaded', function() {
  //initApp;
  //window.mode = getParameterByName('mode');
  //window.actionCode = getParameterByName('oobCode');
  //window.continueUrl = getParameterByName('continueUrl');
  //window.lang = getParameterByName('lang') || 'en';

  // // The Firebase SDK is initialized and available here!
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
});

function authstateobserver(user){
  if(user != null){
    window.user = user;
  }
  /*
  document.getElementById('loading').style.display = 'none';
  document.getElementById('loaded').style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
  */
}

function set_user(user) {
  database.ref("users/" + user.uid).set(
    user, 
    function(error) {
      if (error) {
        //alert(JSON.stringify(error));
      } else {
        // Data saved successfully!
      }
    }
  );
}

/*
function set_vendor(user){
  database.ref("vendors/" + user.uid).set(
    user, 
    function(error) {
      if (error) {
        //alert(JSON.stringify(error));
      } else {
        // Data saved successfully!
      }
    }
  );
}

function set_customer(user){
  database.ref("customers/" + user.uid).set(
    user, 
    function(error) {
      if (error) {
        //alert(JSON.stringify(error));
      } else {
        // Data saved successfully!
      }
    }
  );
}*/

function signout() {
  auth.signOut();
}


function get_vendors(){
  vendors_ref.once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          //var childKey = childSnapshot.key;
          //var childData = childSnapshot.val();
        }
      )
    },
    function(error) {
      //if (error.message != null){}else{}
    }
  );
}

/*
function get_customers(){
  customers_ref.once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          //var childKey = childSnapshot.key;
          //var childData = childSnapshot.val();
        }
      )
    },
    function(error) {
      //if (error.message != null){}else{}
    }
  );
}*/

function get_current_location(){
  if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
    //log("Asking user to get their location");
    navigator.geolocation.getCurrentPosition(geolocationCallback, errorHandler);
  } else {
    alert("Your browser does not support location services")
  }
}

function set_current_location(){

} 

function set_current_conversation(){

}

function get_conversations(){
  
}






/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
  /*
  document.getElementById('user-signed-in').style.display = 'block';
  document.getElementById('user-signed-out').style.display = 'none';
  document.getElementById('name').textContent = user.displayName;
  document.getElementById('email').textContent = user.email;
  document.getElementById('phone').textContent = user.phoneNumber;
  if (user.photoURL) {
    var photoURL = user.photoURL;
    // Append size to the photo URL for Google hosted images to avoid requesting
    // the image with its original resolution (using more bandwidth than needed)
    // when it is going to be presented in smaller size.
    if ((photoURL.indexOf('googleusercontent.com') != -1) ||
        (photoURL.indexOf('ggpht.com') != -1)) {
      photoURL = photoURL + '?sz=' +
          document.getElementById('photo').clientHeight;
    }
    document.getElementById('photo').src = photoURL;
    document.getElementById('photo').style.display = 'block';
  } else {
    document.getElementById('photo').style.display = 'none';
  }
  */
};

/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
  /*
  document.getElementById('user-signed-in').style.display = 'none';
  document.getElementById('user-signed-out').style.display = 'block';
  ui.start('#firebaseui-container', getUiConfig());
  */
};


// Generate a random Firebase location
//var firebaseRef = firebase.database().ref().push();

// Create a new GeoFire instance at the random Firebase location
//var geoFire = new GeoFire(firebaseRef);

/* Callback method from the geolocation API which receives the current user's location */
var geolocationCallback = function(location) {
  var latitude = location.coords.latitude;
  var longitude = location.coords.longitude;
  //log("Retrieved user's location: [" + latitude + ", " + longitude + "]");

  /*
  var username = "wesley";
  geoFire.set(username, [latitude, longitude]).then(function() {
  log("Current user " + username + "'s location has been added to GeoFire");

  // When the user disconnects from Firebase (e.g. closes the app, exits the browser),
  // remove their GeoFire entry
  firebaseRef.child(username).onDisconnect().remove();

  log("Added handler to remove user " + username + " from GeoFire when you leave this page.");
  }).catch(function(error) {
    log("Error adding user " + username + "'s location to GeoFire");
  });
  */
}

/* Handles any errors from trying to get the user's current location */
var errorHandler = function(error) {
  if (error.code == 1) {
    log("Error: PERMISSION_DENIED: User denied access to their location");
    alert("Error: PERMISSION_DENIED: User denied access to their location");
  } else if (error.code === 2) {
    log("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
    alert("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
  } else if (error.code === 3) {
    log("Error: TIMEOUT: Calculating the user's location too took long");
    alert("Error: TIMEOUT: Calculating the user's location too took long");
  } else {
    log("Unexpected error code");
    alert("Unexpected error code");
  }
};