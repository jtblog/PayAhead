var host = window.location.href.slice(0, window.location.href.lastIndexOf("/"));

var authorization, user_json;
var cre_ac_cntr, cre_ac_frm, vrfy_otp_frm;

var organizations = {}; 
var customers = {};
var transactions = {};

window._prepare = function(){
  
  var site = window.location.href + "";
  switch(site){
    case host+"/":
      break;
    case host:
      break;
    case host+"/user":
      usr();
      break;
    case host+"/user.html":
      usr();
      break;
    case host+"/signin":
      $("#login_form").submit(signin);
      break;
    case host+"/signin.html":
      $("#login_form").submit(signin);
      break;
    case host+"/signup":
      sgup();
      break;
    case host+"/signup.html":
      sgup();
      break;
    case host+"/pay":
      py();
      break;
    case host+"/pay.html":
      py();
      break;
  }
};

function py(){
  if( document.getElementById("amount_input") != undefined){
      setInputFilter(document.getElementById("amount_input"), function(value) {
        return /^\d*$/.test(value);
      });
  }
  prepare_for_payment();
  $("#payment_form").submit(pay_popup);
};

function usr(){
  var input = document.querySelector("#pno_input");
    window.pno_input = window.intlTelInput(input);
    get_profile();
    $("#signout_btn").click(signout);
};

function sgup(){
    if( document.getElementById("bvn_input") != undefined){
      setInputFilter(document.getElementById("bvn_input"), function(value) {
        return /^\d*$/.test(value);
      });
    };
    if( document.getElementById("otp_input") != undefined){
      setInputFilter(document.getElementById("otp_input"), function(value) {
        return /^\d*$/.test(value);
      });
    };
    
    //document.getElementById('firebaseui-auth-container').innerHTML = "";
    window.cre_ac_cntr = document.getElementById("create_acct_container");
    window.cre_ac_frm = document.getElementById("create_acct_form");
    window.vrfy_otp_frm = document.getElementById("verify_otp_form");
    removeElement("verify_otp_form");
    $("#create_acct_form").submit(signup);
    var input = document.querySelector("#pno_input");
    window.pno_input = window.intlTelInput(input);
    populate_industry();
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
  setTimeout(window._prepare, 1000);
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
  if (input.files || input.files[0]) {
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
  reset_all_span();
  var endpoint = "/auth/signup";
  window.su_details = {
    'displayName' : $("#fn_input").val() + " " + $("#ln_input").val(),
    'industry' : $('#industry_input option:selected').text(),
    'password' : $("#password_input").val(),
    'bvn' : $("#bvn_input").val(),
    'email' : $("#email_input").val(),
    //'phoneNumber' : $("#pno_input").intlTelInput("getNumber"),
    'phoneNumber' : pno_input.getNumber(),
    'photoURL' : ""
  }

  var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "POST",
      "contentType": "application/json",
      "dataType": "json",
      "headers": {
            "Content-Type": "application/json"
      },
      "data": JSON.stringify(window.su_details)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.location = "signin.html";
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        populate_industry();
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
};

function get_profile(){

  if(isNullOrUndefinedOrEmpty(localStorage["uid"])){
    window.location = "signin.html";
  }else{
    var endpoint = "/get_profile/" + localStorage["uid"];
      
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "GET",
      "headers" : {
        "authorization" : localStorage["authorization"],
      }
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.user_json = data["user"];
        window.authorization = data["authorization"];
        populate_user_view();
        get_transactions();
        get_organizations();
        get_users();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};

function prepare_for_payment(){

  if( isNullOrUndefinedOrEmpty(localStorage["uid"]) ){
    window.location = "signin.html";
  }else{
    
    if( isNullOrUndefinedOrEmpty(localStorage["sub_details0"]) ){
      window.location = "user.html";
    }else{
      window.sub_details0 = JSON.parse(localStorage["sub_details0"]);
    }

    var endpoint = "/get_profile/" + localStorage["uid"];

    var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "GET",
      "headers" : {
        "authorization" : localStorage["authorization"]
      }
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.user_json = data["user"];
        window.authorization = data["authorization"];
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", "https://js.paystack.co/v1/inline.js");
        document.getElementsByTagName("head")[0].appendChild(script);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        window.location = "/signin.html";
        console.log(jqXHR.responseText);
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};

var pay_popup = function(e){
  e.preventDefault();
  try{
    if(!isNullOrUndefinedOrEmpty(JSON.stringify(window.sub_details0))){
        var secret = {};

        var config = {
          "email" : window.user_json["email"],
          " amount" : "" + ($("#amount_input").val() * 100),
          //"bearer": "account" or "subaccount",
          "subaccount": window.sub_details0["subaccount"],
          onClose: function(){
            //alert('Window closed.');
          },
          callback: function(response){
            save_t(response);
          }
        };
        
        var endpoint = "/payment/get_paystack_keys";
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": host + endpoint,
          "method": "GET",
          "headers": {
            "authorization": window.authorization
          }
        }

        $.ajax(settings).done(function (response) {
          var data = response;
          secret["p_key"] = data["p_key"];
          secret["s_key"] = data["s_key"];
          checkout(secret["s_key"], config);
        }); 
      }
  }catch(e){
    console.log(e);
  }
};

function save_t(_res){
  var endpoint = "/payment/save_transaction";
  var _p = {
    "reference" : _res.reference,
    "payeeId" : window.sub_details0["uid"],
    "payee" : window.sub_details0["business_name"],
    "payerId" : window.user_json["uid"],
    "payer" : window.user_json["displayName"],
    "epochPayed" : toEpoch(_res.paid_at)
  }

  var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "POST",
      "contentType": "application/json",
      "dataType": "json",
      "headers" : {
        "Content-Type": "application/json",
        "authorization" : localStorage["authorization"],
      },
      "data": JSON.stringify(_p)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        console.log(data);
        window.location = "user.html";
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
}

function toEpoch(strDate){
  var datum = Date.parse(strDate);
  return datum/1000;
}

function checkout(key, config){
  var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://api.paystack.co/transaction/initialize",
      "method": "POST",
      "contentType": "application/json",
      "dataType": "json",
      "headers" : {
        "Content-Type": "application/json",
        "Authorization" : "Bearer " + key
      },
      "data": JSON.stringify(config)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.location = data.data.authorization_url;
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
}

function populate_user_view(){
  $(".profile-name").html(window.user_json['displayName']);
      $("#fn_input").val(window.user_json['displayName'].split(" ")[0]);
      $("#ln_input").val(window.user_json['displayName'].split(" ")[1]);
      $("#password_input").val(window.user_json['password']);
      $("#bvn_input").val(window.user_json['bvn']);

      if( isNullOrUndefinedOrEmpty(window.user_json['email'])){
       $("#email_input").val(""); 
      }else{
        $("#email_input").val(window.user_json['email']);
      }
      if(!isNullOrUndefinedOrEmpty(window.user_json['phoneNumber'])){
        window.pno_input.setNumber(window.user_json['phoneNumber']);
      }else{
        window.pno_input.setNumber('');
      }

      opt = document.createElement('OPTION');
      opt.textContent = window.user_json['industry'];
      document.getElementById('industry_group').appendChild(opt);
};

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
      var error = JSON.parse(jqXHR.responseText);
      errorHandler(error);
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
  
  reset_all_span();
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
      "headers" : {
        "Content-Type": "application/json"
      },
      "data": JSON.stringify(window.si_details)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        localStorage["uid"] = data["user"]["uid"];
        localStorage["authorization"] = data["authorization"];
        window.location = "user.html";
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
};

function get_users(){
  if( isNullOrUndefinedOrEmpty(localStorage["authorization"])){
    window.location = "signin.html";
  }else{
    var endpoint = "/get_users";
    
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "GET",
      "headers" : {
        "authorization" : localStorage["authorization"],
      }
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.users = data;
        populate_users_view();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};

function get_organizations(){

  if( isNullOrUndefinedOrEmpty(localStorage["authorization"]) ){
    window.location = "signin.html";
  }else{
    var endpoint = "/db/get_organizations/";
      
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "GET",
      "headers" : {
        "authorization" : localStorage["authorization"],
      }
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.organizations = data;
        populate_organizations_view();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};

function populate_organizations_view(){
  document.getElementById("organizations_card").innerHTML = "";

  Object.keys(window.organizations).forEach(function(key) {
    var o_view = window.company1 + window.organizations[key]["business_name"] + window.company3 +
      window.organizations[key]["description"] + window.company5 + window.organizations[key]["industry"] + window.company7;
    o_view = o_view.replaceAll("business_uid", key);
    document.getElementById("organizations_card").innerHTML = document.getElementById("organizations_card").innerHTML + o_view;

    
  });

  Object.keys(window.organizations).forEach(function(key) {
    $("#" + key + "_btn").click(org_dropdown);
    $('#' + key + "_phref").click(go_to_paymentpage);
  });

  if(document.getElementById("organizations_card").innerHTML == ""){
    $("#organizations_card").append("<br> No registered vendors /organization for now. </br><br>Try again later");
  }
};

var go_to_paymentpage = function(e){
  var id = $(this).attr('id');
  id = id.replaceAll("_phref", "");
  Object.keys(window.organizations).forEach(function(key) {
    if(key == id){
      localStorage["sub_details0"] = window.organizations[key];
    }
  })
}

var org_dropdown = function(e){
  var href = $(this).attr('href');
  if($(href).hasClass("show")){
    $(href).removeClass("show");
  }else{
    $(href).addClass("show");
  }
}

var chat = function(e){
  
}

function get_transactions(){
  if( isNullOrUndefinedOrEmpty(localStorage["authorization"])){
    window.location = "signin.html";
  }else{
    var endpoint = "/payment/get_transactions/" + window.user_json["uid"];
      
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": host+endpoint,
      "method": "GET",
      "headers" : {
        "authorization" : localStorage["authorization"],
      }
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.transactions = data;
        populate_transactions_view();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};

function populate_transactions_view(){
  document.getElementById("transactions_card").innerHTML = "";
  Object.keys(window.transactions).forEach(function(key) {
    var t_view = window.trans1 + window.transactions[key]["paymentId"] + window.trans3 +
      window.transactions[key]["payee"] + window.trans5 + window.transactions[key]["payer"] + window.trans7 + 
      window.transactions[key]["epochPayed"] + window.trans9 + window.transactions[key]["epochVerified"] + window.trans11;
    t_view = t_view.replaceAll("payment_id", key);
    document.getElementById("transactions_card").innerHTML = document.getElementById("transactions_card").innerHTML + t_view;
    
  });

   Object.keys(window.transactions).forEach(function(key) {
    $("#" + key + "_btn").click(trans_dropdown);
    //$('#' + key + "_rfhref").click(go_to_refundpage);
  });

  if(document.getElementById("transactions_card").innerHTML == ""){
    $("#transactions_card").append("<br> No transactions");
  }
};

var trans_dropdown = function(e){
  var href = $(this).attr('href');
  if($(href).hasClass("show")){
    $(href).removeClass("show");
  }else{
    $(href).addClass("show");
  }
}

function post_error(error){
  var endpoint = "/report_error";
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": host+endpoint,
    "contentType": "application/json",
    "dataType": "json",
    "headers" : {
      "Content-Type": "application/json"
    },
    "method": "POST",
    "data": JSON.stringify(error)
  }

  $.ajax(settings)
    .done(function (response) {
      var data = response;
      console.log(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    });
}

/*function isEmail(str){
  var format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(str.match(format)){
    return true;
  }else{
    return false;
  }
};*/

var signout = function() {
  reset_all_span();
  if(isNullOrUndefinedOrEmpty(window.authorization)){
    window.location = "index.html";
  }else{
    
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
      localStorage["uid"]  = null;
      localStorage["authorization"] = "";
      localStorage["authorization"] = null;
      window.location = "index.html";
      console.log(response);
    });
  }
};

function addElement(parent, element) {
    parent.appendChild(element);
};

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
};

function get_current_location(){
  if (typeof navigator !== "undefined" || typeof navigator.geolocation !== "undefined") {
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
  try{
    switch(error.code) {
      case "auth/weak-password":
          $("#password_span").html(error.message);
          break;
      case "auth/wrong-password":
          $("#password_span").html("Incorrect password");
          break;
      case "auth/user-disabled":
          $("#error_span").html("Your account has been disabled contact administrator");
          break;
      case "auth/email-already-exists":
          $("#email_span").html("Email Address already exists");
          break;
      case "auth/invalid-email":
          $("#email_span").html("Invalid email");
          break;
      case "auth/user-not-found":
          $("#ep_span").html("Account does not exist try creating an account");
          break;
      case "auth/phone-number-already-exists":
          $("#pno_span").html("Phone Number already exist");
          break;
      case "auth/invalid-phone-number":
          $("#pno_span").html("Phone Number is invalid.");
          break;
      default:
          $("#error_span").html(error.message);
          post_error(error);
          break;
    }
  }catch(e){}
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

function reset_all_span(){
  var allSpans = document.getElementsByTagName('span');
  for(var i = 0; i<allSpans.length; i++){
    allSpans[i].innerHTML = "";
  };
}

function isNullOrUndefinedOrEmpty(_in){
  switch(_in){
    case null:
      return true;
      break;
    case undefined:
      return true;
      break;
    case "null":
      return true;
      break;
    case "undefined":
      return true;
      break;
    default:
      return false;
      break;
  };

  if(typeof _in == "string"){
    if(_in.trim() == ""){
      return true;
    }
  }else if(typeof _in == "undefined"){
    return true;
  }
};

String.prototype.replaceAll = function(search, replaceAllment) {
    var target = this;
    return target.split(search).join(replaceAllment);
};

/*function to_postman_JSONstringify_type(_in){
  var strg = JSON.stringify(_in);
  var chunks = ('"' + strg.split('"').join('\\"') + '"').split("'").join('\\"');
  return chunks;
}*/