var host = window.location.href.slice(0, window.location.href.lastIndexOf("/"));

var authorization, user_json;
var cre_ac_cntr, cre_ac_frm, vrfy_otp_frm;

var vendors = {}; 
var customers = {};
var payments = {};

window.prepare_firebase = function(){

  //window.auth.onAuthStateChanged(authstateobserver);
  var site = window.location.href+"";
  if(site.endsWith("signup.html") || site.indexOf("signup.html")>-1){
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

  if(site.endsWith("user.html") || site.indexOf("user.html")>-1){
    get_profile();
    $("#signout_btn").click(signout);
  }

  if(site.endsWith("pay.html") || site.indexOf("pay.html")>-1){
    if( document.getElementById("amount_input") != undefined){
      setInputFilter(document.getElementById("amount_input"), function(value) {
        return /^\d*$/.test(value);
      });
    }
    get_profile2();
    $("#payment_form").submit(pay_redirect);
  }
};

var initApp = function() {
  prepare_dependencies();
};

function prepare_dependencies(){
  /*var scriptElements = document.getElementsByTagName('script');
  var firstsource = scriptElements[0].src;
  var folder = firstsource.substring(document.URL.substring(0, document.URL.lastIndexOf("/")+1).length, firstsource.lastIndexOf("/")+1);
  
  for(i=0; i<libs.length; i++){
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", folder+libs[i]);
    document.getElementsByTagName("head")[0].appendChild(script);
  }*/
  setTimeout(window.prepare_firebase, 1000);
  /*08033953050
  08085221450*/
};

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
        //document.getElementById('profilepic').src = e.target.result;
        //$('#profilepic').attr('src', e.target.result);
      }
    };
  reader.readAsDataURL(input.files[0]);
  }
};

var signup = function(e){
  e.preventDefault();
  var endpoint = "/auth/signup";
  window.su_details = {
    'displayName' : $("#fn_input").val() + " " + $("#ln_input").val(),
    'industry' : $('#industry_input option:selected').text(),
    'password' : $("#password_input").val(),
    'bvn' : $("#bvn_input").val(),
    'email' : $("#email_input").val(),
    'phoneNumber' : $("#pno_input").val(),
    'photoURL' : ""
  }

  var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "POST",
      "contentType": "application/json",
      "dataType": "json",
      "data": JSON.stringify(window.su_details)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.location = "signin.html";
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        populate_industry();
        console.log(jqXHR.responseText);
        /*if (error.code != null){
              switch(error.code) {
                case "auth/weak-password":
                  $("#password_span").html(error.message);
                  break;
                default:
                  $("#ep_span").html(error.message);
              } 
            }
            console.log(error);
            */
      });
};

function get_profile(){

  var endpoint = "/get_profile/" + localStorage["uid"];
      
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "GET",
      //"contentType": "application/json",
      //"dataType": "json",
      "headers" : {
        "authorization" : localStorage["authorization"],
      },
      "data": ""
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.user_json = data["user"];
        window.authorization = data["authorization"];
        populate_user_view();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        window.location = "/signin.html";
        console.log(jqXHR.responseText);
        /*if (error.code != null){
            switch(error.code) {
              case "auth/weak-password":
                  $("#password_span").html(error.message);
                  break;
                  default:
                    $("#ep_span").html(error.message);
              } 
          }
            console.log(error);
            */
      });
};

function get_profile2(){

  var endpoint = "/get_profile/" + localStorage["uid"];
      
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "GET",
      //"contentType": "application/json",
      //"dataType": "json",
      "headers" : {
        "authorization" : localStorage["authorization"],
      },
      "data": ""
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.user_json = data["user"];
        window.authorization = data["authorization"];
        //populate_user_view();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        window.location = "/signin.html";
        console.log(jqXHR.responseText);
        
        /*if (error.code != null){
            switch(error.code) {
              case "auth/weak-password":
                  $("#password_span").html(error.message);
                  break;
                  default:
                    $("#ep_span").html(error.message);
              } 
          }
            console.log(error);
            */
      });
};

var pay_redirect = function(e){
  e.preventDefault();
  var dat = {
    "email" : window.user_json["email"],
    "amount" : $("#amount_input").val()
  }

  var endpoint = "/payment/initialize";

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": host + endpoint,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "authorization": window.authorization
    },
    "data": JSON.stringify(dat)
  }

  $.ajax(settings).done(function (response) {
    var data = response;
    localStorage["authorization_data"] = data;
    window.location = data["authorization_url"];
  });
}

function populate_user_view(){
  $(".profile-name").html(window.user_json['displayName']);
      $("#fn_input").val(window.user_json['displayName'].split(" ")[0]);
      $("#ln_input").val(window.user_json['displayName'].split(" ")[1]);
      $("#password_input").val(window.user_json['password']);
      $("#bvn_input").val(window.user_json['bvn']);

      if(window.user_json['email'] != null && typeof(window.user_json['email']) != undefined){
        $("#email_input").val(window.user_json['email']);
      }else{
        $("#email_input").val("");
      }
      if(window.user_json['phoneNumber'] != null && typeof(window.user_json['phoneNumber']) != undefined){
        $("#pno_input").val(window.user_json['phoneNumber']);
      }else{
        $("#pno_input").val('');
      }

      opt = document.createElement('OPTION');
      opt.textContent = window.user_json['industry'];
      document.getElementById('industry_group').appendChild(opt);
}

function populate_industry(){
  var endpoint = "/db/industries";
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": host+endpoint,
    //"contentType": "application/json",
    //"dataType": "json",
    "method": "GET"
  }

  document.getElementById('industry_group').innerHTML = "";
  $.ajax(settings)
    .done(function (response) {
      var data = response;
      for(i=0; i<data.length; i++){
        opt = document.createElement('OPTION');
        opt.textContent = data[i];
        opt.value = i;
        document.getElementById('industry_group').appendChild(opt);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    });
};

var verifyOTPcode = function(e){
  /*
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
  */
};

var signin = function(e){
  e.preventDefault();
  
  var endpoint = "/auth/signin"
  window.si_details = {
    'password' : $("#password_input").val(),
    'emailOrPhoneNumber' : $("#ep_input").val()
  };

  var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "POST",
      "contentType": "application/json",
      "dataType": "json",
      "data": JSON.stringify(window.si_details)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        console.log(data);
        localStorage["uid"] = data["user"]["uid"];
        localStorage["authorization"] = data["authorization"];
        window.location = "user.html";
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
        /*if (error.code != null){
            switch(error.code) {
              case "auth/weak-password":
                $("#password_span").html(error.message);
                break;
              default:
                $("#ep_span").html(error.message);
            } 
          }
          console.log(error);
        */
      });
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
  /*if(user != null && user.email != null){
    window.user = user;
    window.user_json = JSON.parse(JSON.stringify(window.user));
  }*/
};


var signout = function() {
  if(window.authorization !== null || window.authorization !== "" || typeof(window.authorization) !== undefined){
    var endpoint = "/signout/" + window.user_json["uid"]

    var settings = {
      "async": true,
      "crossDomain": true,
      "url": window.host + endpoint,
      "method": "POST",
      "headers": {
        "authorization": window.authorization
      }
    }

    $.ajax(settings).done(function (response) {
      localStorage["uid"] = "";
      localStorage["authorization"] = "";
      window.location = "index.html";
      console.log(response);
    });
  }else{
    window.location = "index.html";
  }
};

/*
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
function get_vendors(){
};
*/

function addElement(parent, element) {
    parent.appendChild(element);
};

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
};

function get_current_location(){
  if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
    //log("Asking user to get their location");
    navigator.geolocation.getCurrentPosition(geolocationCallback, errorHandler);
  } else {
    alert("Your browser does not support location services")
  }
};

//function set_current_location(){} 

//function set_current_conversation(){}

// Generate a random Firebase location
//var firebaseRef = firebase.database().ref().push();

// Create a new GeoFire instance at the random Firebase location
//var geoFire = new GeoFire(firebaseRef);

/* Callback method from the geolocation API which receives the current user's location */
var geolocationCallback = function(location) {
  var latitude = location.coords.latitude;
  var longitude = location.coords.longitude;
  //firebaseRef.child(username).onDisconnect().remove();
};

/* Handles any errors from trying to get the user's current location */
var errorHandler = function(error) {
  /*
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
  */
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
};