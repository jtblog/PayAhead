var database, auth, messaging, storage, ui, user, phone_user, user_json;
var vendors_ref, customers_ref, payments_ref, reports_ref, phone_users_ref, industry_ref;
var cre_ac_cntr, cre_ac_frm, vrfy_otp_frm;

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
  //window.messaging = firebase.messaging();
  window.storage = firebase.storage();
  //try{}catch(error){}

  window.vendors_ref = database.ref('/vendors/');
  window.customers_ref = database.ref('/customers/');
  window.payments_ref = database.ref('/payments/');
  window.reports_ref = database.ref('/reports/');
  window.phone_users_ref = database.ref('/phone_users/');
  window.industry_ref = database.ref('/industry/');
  
  window.auth.onAuthStateChanged(authstateobserver);
  var site = window.location.href+"";
  if(site.endsWith("signup.html") || site.indexOf("signup.html")>-1){
    if(auth.currentUser != null){
      signOut();
    }
    if( document.getElementById("bvn_input") != undefined){
      setInputFilter(document.getElementById("bvn_input"), function(value) {
        return /^\d*$/.test(value);
      });
    }
    if( document.getElementById("otp_input") != undefined){
      setInputFilter(document.getElementById("otp_input"), function(value) {
        return /^\d*$/.test(value);
      });
    }
    
    //document.getElementById('firebaseui-auth-container').innerHTML = "";
    //window.ui.start('#firebaseui-auth-container', window.uiConfig);
    window.cre_ac_cntr = document.getElementById("create_acct_container");
    window.cre_ac_frm = document.getElementById("create_acct_form");
    window.vrfy_otp_frm = document.getElementById("verify_otp_form");
    removeElement("verify_otp_form");
    $("#create_acct_form").submit(signup);
    populate_industry();
  }

  if(site.endsWith("signin.html") || site.indexOf("signin.html")>-1){
    $("#login_form").submit(signin);
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

/*
var continue_registration = function(e) {
  e.preventDefault();
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
};*/

var signup = function(e){
  e.preventDefault();
  var ep = $("#ep_input").val();

  window.su_details = {
    'displayName' : $("#fn_input").val() + " " + $("#ln_input").val(),
    'industry' : $('#industry_input option:selected').text(),
    'password' : $("#password_input").val(),
    'bvn' : $("#bvn_input").val()
  }

  if(window.su_details['password'].length >= 8){
    if(isEmail(ep)){
      window.su_details['email'] = ep;
        auth.createUserWithEmailAndPassword(window.su_details['email'], window.su_details['password']).then(
          function(value) { 
              window.user = auth.currentUser;
              window.user_json = JSON.parse(JSON.stringify(window.user));
              Object.keys(su_details).forEach(function(key) {
                window.user_json[key] = window.su_details[key];
              });
              set_user(window.user_json);
              set_customer(window.user_json);
              localStorage["user"] = JSON.stringify(window.user_json);
              window.user.sendEmailVerification().then(
                function() {
                    // Email sent.
                    $("#create_acct_container").html("A verification link has been sent to your email address");
                }, function(error) {
                    // An error happened.
                    //Verification not sent
                    console.log(error);
                }
              );
              window.location = "user.html";

          }, 
          function(error) { 
            if (error.code != null){
              switch(error.code) {
                case "auth/weak-password":
                  $("#password_span").html(error.message);
                  break;
                default:
                  $("#ep_span").html(error.message);
              } 
            }
            console.log(error);
          });
    }else{
        if(libphonenumber.isValidNumber(ep)){
          window.su_details['phoneNumber'] = ep;
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('signup_btn', {
            'size': 'invisible',
            'callback': function(response) {
              //response
            }
          });
          recaptchaVerifier.render().then(function(widgetId) {
            window.recaptchaWidgetId = widgetId;
          });


          window.auth.signInWithPhoneNumber(su_details['phoneNumber'], window.recaptchaVerifier)
            .then(function (confirmationResult) {
              // SMS sent. Prompt user to type the code from the message, then sign the user in with confirmationResult.confirm(code).
              e.preventDefault();
              window.confirmationResult = confirmationResult;
              removeElement("create_acct_form");
              addElement(cre_ac_cntr, vrfy_otp_frm);
              $("#verify_otp_form").submit(verifyOTPcode);
              document.getElementById("verify_otp_form").style.visibility = "visible"; 
            }).catch(function (error) {
              // Error; SMS not sent
              if (error.code != null){
                switch(error.code) {
                  case "auth/user-disabled":
                    //to developer
                    break;
                  case "auth/quota-exceeded":
                    //to developer
                    break;
                  case "auth/operation-not-allowed":
                    //to developer
                    break;
                  default:
                    $("#ep_span").html(error.message);
                } 
              }
              console.log(error);
            });
        }else{
          //Neither a phone number nor an email
          $("#ep_span").html("Neither a phone number nor an email");
          console.log('It is neither a phone number nor an email');
        }
    }
  }else{
    //Paswword is short
    $("#password_span").html("Password should not be less than 8 letters");
    console.log('Password should be 8 letters or more');
  }
};

function populate_industry(){
  var first = false;
  var i_html = '';
  document.getElementById('industry_group').innerHTML = "";
  industry_ref.orderByKey().once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          opt = document.createElement('OPTION');
          opt.textContent = childSnapshot.val();
          opt.value = childSnapshot.key;
          document.getElementById('industry_group').appendChild(opt);
        }
      )
    },
    function(error) {
      //if (error.message != null){}else{}
    }
  );
  document.getElementById('industry_group').innerHTML = i_html;
}

var verifyOTPcode = function(e){
  e.preventDefault();
  var otp = $("#otp_input").val();
  window.confirmationResult.confirm(otp).then(function (result) {
    // User signed in successfully.
    window.user = result.user;
    window.user_json = JSON.parse(JSON.stringify(window.user));
    Object.keys(su_details).forEach(function(key) {
      window.user_json[key] = window.su_details[key];
    });
    set_phone_user(window.user_json);
    set_customer(window.user_json);
    localStorage["user"] = JSON.stringify(window.user_json);
    window.location = "/user.html";
  }).catch(function (error) {
    // User couldn't sign in (bad verification code?)
    if (error.code != null){
      $("#otp_span").html(error.message);
    }
    console.log(error);
  });
};

var signin = function(e){
  e.preventDefault();
  var ep = $("#ep_input").val();
  window.si_details = {
    'password' : $("#password_input").val()
  };
  
  if(isEmail(ep)){
    window.si_details['email'] = ep;
    var credential = firebase.auth.EmailAuthProvider.credential(window.si_details['email'], window.si_details['password']);
    firebase.auth().signInWithCredential(credential)
      .then(function(userCredential) {
        window.user = userCredential.user;
        window.user_json = JSON.parse(JSON.stringify(user));
        localStorage["user"] = JSON.stringify(window.user_json);
        window.location = "/user.html";
      },
      function(error) {
        if (error.code != null){
          switch(error.code) {
            case "auth/user-disabled":
              //to developer
              break;
            case "auth/operation-not-allowed":
              //to developer
              break;
            case "auth/account-exists-with-different-credential":
              $("#ep_span").html("Email already associated with another account.");
              break;
            case "auth/user-not-found":
              window.location = "/signup.html";
              break;
            case "auth/wrong-password":
              $("#password_span").html(error.message);
              break;
            //default:
              //$("#ep_span").html(error.message);
          } 
        }
        console.log(error);
      });
  }else{
    if(libphonenumber.isValidNumber(ep)){
      window.si_details['phoneNumber'] = ep;
      phone_users_ref.orderByChild("phoneNumber").equalTo(window.si_details['phoneNumber']).once('value').then(
        function(snapshot) {
          snapshot.forEach(
            function(childSnapshot) {
              exst = "yes";
              if(window.si_details['password'] == childSnapshot.val()['password']){
                window.user_json = childSnapshot.val();
                localStorage["user"] = JSON.stringify(window.user_json);
                window.location = "/user.html";
              }else{
                //Error; Password doesn't match record
                $("#password_span").html("Incorrect password. Forgot your password?");
                console.log("Incorrect password. Forgot your password?");
              }
            }
          )
        },
        function(error) {
          console.log(error);
        }
      );
    }else{
        //Neither a phone number nor an email
        console.log('It is neither a phone number nor an email');
    }
  }

  /*
  phone_users_ref.orderByKey().equalTo(ldetails["phone-number"]).once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          //var childKey = childSnapshot.key;
          //var childData = childSnapshot.val();
          //alert(JSON.stringify(childSnapshot.val()));
        }
      )
    },
    function(error) {
      //if (error.message != null){}else{}
    }
  );
  
  var credential = firebase.auth.EmailAuthProvider.credential(ldetails['email'], ldetails['password']);
  firebase.auth().signInAndRetrieveDataWithCredential(credential)
    .then(function(userCredential) {
      window.user = userCredential.user;
      window.user_json = JSON.parse(JSON.stringify(user));
      window.location = "/user.html";
      //console.log(userCredential.additionalUserInfo.username);
      //console.log(userCredential.additionalUserInfo.isNewUser);
    });
  */
};

function isEmail(str){
  var format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(str.match(format)){
    return true;
  }else{
    return false;
  }
};

function authstateobserver(user){
  if(user != null && user.email != null){
    window.user = user;
    window.user_json = JSON.parse(JSON.stringify(window.user));
  }
};

function set_user(uj) {
  database.ref("users/" + window.user_json["uid"]).set(
    window.user_json, 
    function(error) {
      if (error) {
        //alert(JSON.stringify(error));
        console.log(error);
      } else {
        // Data saved successfully!
      }
    }
  );
};

function set_phone_user(uj) {
  database.ref("phone_users/" + window.user_json["uid"]).set(
    window.user_json, 
    function(error) {
      if (error) {
        //alert();
        console.log(error);
      } else {
        // Data saved successfully!
      }
    }
  );
};

function set_customer(uj){
  database.ref("customers/" + window.user_json["uid"]).set(
    window.user_json, 
    function(error) {
      if (error) {
        //alert(JSON.stringify(error));
        console.log(error);
      } else {
        // Data saved successfully!
      }
    }
  );
};

function signout() {
  auth.signOut();
};

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
};

function addElement(parent, element) {
    parent.appendChild(element);
};

function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
};

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
};

function set_current_location(){} 

function set_current_conversation(){}

var handleSignIn = function(user) {};

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
  //firebaseRef.child(username).onDisconnect().remove();
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