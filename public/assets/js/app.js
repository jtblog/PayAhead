//import { loadavg } from "os";
var database, auth, messaging, storage, ui, user, phone_user, user_json;
var vendors_ref, customers_ref, payments_ref, reports_ref;

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
  window.reports_ref = database.ref('/reports/');

  window.auth.onAuthStateChanged(authstateobserver);
  var site = window.location.href+"";
  if(site.endsWith("signup.html") || site.indexOf("signup.html")>-1){
    document.getElementById('firebaseui-auth-container').innerHTML = "";
    window.ui.start('#firebaseui-auth-container', window.uiConfig);
  }

  if(site.endsWith("signin.html") || site.indexOf("signin.html")>-1){
    $("#login-form").submit(login);
  }
  
}

function prepare_uiConfig(){
  return {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        if (authResult.user != null) {
          if(typeof(authResult.user.email) != undefined && authResult.user.email != null){
            window.user = authResult.user;
            window.user_json = JSON.parse(JSON.stringify(user));
            window.location = "/user.html";
          }else{
            window.phone_user = authResult.user;
            window.user_json = JSON.parse(JSON.stringify(phone_user));
            create_account_ui();
          }
        }else{
          if(window.auth.currentUser != null){
            if(typeof(window.auth.currentUser.email) != undefined && window.auth.currentUser.email != null){
              window.user = window.auth.currentUser.user;
              window.user_json = JSON.parse(JSON.stringify(user));
              window.location = "/user.html";
            }else{
              window.phone_user = window.auth.currentUser.user;
              window.user_json = JSON.parse(JSON.stringify(phone_user));
              create_account_ui();
            }
          }
        }
        return false;
      },
      uiShown: function() {}
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

function create_account_ui(){
  document.getElementById('firebaseui-auth-container').innerHTML = create_account
  $("#create-acct-form").submit(continue_registration);

  setInputFilter(document.getElementById("bvn-input"), function(value) {
    return /^\d*$/.test(value);
  });
}

function previewImage(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      if(typeof(document.getElementById('profilepic')) != undefined){
        document.getElementById('profilepic').src = e.target.result;
        //$('#profilepic').attr('src', e.target.result);
      }
    };
  reader.readAsDataURL(input.files[0]);
  }
}

var continue_registration = function(e) {

  user_json['email'] = $("#email-input").val();
  user_json['password'] = $("#password-input").val();
  user_json['displayName'] = $("#firstname-input").val() + ' ' + $("#lastname-input").val();
  user_json['bvn'] = $("#bvn-input").val();

  phone_user.updateProfile({
    displayName: user_json['displayName'],
    photoURL: null
  }).then(function() {
    //var displayName = user.displayName;
    //var photoURL = user.photoURL;
  }, function(error) {
    // An error happened.
    alert(JSON.stringify(error));
  });

  var credential = firebase.auth.EmailAuthProvider.credential(user_json['email'], user_json['password']);
  auth.currentUser.linkAndRetrieveDataWithCredential(credential).then(function(usercred) {
    window.user = usercred.user;
    user.sendEmailVerification();
    user_json = JSON.parse(JSON.stringify(user));
    user_json['bvn'] = $("#bvn-input").val();
    set_user(user_json);
    set_customer(user_json);

    window.location = "/user.html";
  }, function(error) {
    //alert(JSON.stringify(error));
    //{"code":"auth/provider-already-linked","message":"User can only be linked to one identity for the given provider."}
  });

  e.preventDefault();
};

var login = function(e){
  var ldetails = {
    'email' : $("#email-input").val(),
    'password' : $("#password-input").val()
  };
  var credential = firebase.auth.EmailAuthProvider.credential(ldetails['email'], ldetails['password']);
  firebase.auth().signInAndRetrieveDataWithCredential(credential)
    .then(function(userCredential) {
      window.user = userCredential.user;
      window.user_json = JSON.parse(JSON.stringify(user));
      window.location = "/user.html";
      //console.log(userCredential.additionalUserInfo.username);
      //console.log(userCredential.additionalUserInfo.isNewUser);
    });
    e.preventDefault();
}

function authstateobserver(user){
  if(user != null && user.email != null){
    window.user = user;
  }
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
}

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

var handleSignIn = function(user) {
  
};

/**
 * Displays the UI for a signed out user.
 */
var handleSignOut = function() {
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
    log("Error: TIMEOUT: Calculating the user's location too took long0");
    alert("Error: TIMEOUT: Calculating the user's location too took long");
  } else {
    log("Unexpected error code");
    alert("Unexpected error code");
  }
};

function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
    });
  });
}