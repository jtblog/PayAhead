var host = window.location.href.slice(0, window.location.href.lastIndexOf("/"));

var authorization, user_json;
var cre_ac_cntr, cre_ac_frm, vrfy_otp_frm;

var organizations = {}; 
var users = {};
var transactions = {};

window._prepare = function(){
  
  var site = window.location.href + "";
  if(!isNullOrUndefinedOrEmpty($("#login_form"))){
    $("#login_form").submit(function(e){e.preventDefault();});
    $("#admin_signin_btn").click(signin);
  }
  if(!isNullOrUndefinedOrEmpty($("#update_form")) && site == host + "/admin_user.html"){
    usr();
  }
  if(!isNullOrUndefinedOrEmpty($("#create_biz_form"))){
    $("#create_biz_form").submit(function(e){e.preventDefault();});
    $("#create_biz_btn").click(add_business);
    //usr();
  }
  switch(site){
    /*case host+"/":
      break;
    case host:
      break;
    case (host + "/admin_user" || host + "/admin_user.html"):
      usr();
      break;
    case host+"/signup":
      //sgup();
      break;
    case host+"/signup.html":
      //sgup();
      break;
    case host+"/pay":
      //py();
      break;
    case host+"/pay.html":
      //py();
      break;*/
  }
};

var initApp = function() {
  prepare_dependencies();
};

function prepare_dependencies(){
  setTimeout(window._prepare, 1000);
  /*08033953050
  08085221450*/
};

window.addEventListener('load', initApp);

/*function py(){
  if( document.getElementById("amount_input") != undefined){
      setInputFilter(document.getElementById("amount_input"), function(value) {
        return /^\d*$/.test(value);
      });
  }
  prepare_for_payment();
  $("#payment_form").submit(pay_popup);
};*/

function usr(){
  var input = document.querySelector("#pno_input");
    window.pno_input = window.intlTelInput(input);
    var user_input = document.querySelector("#usr_pno_input");
    window.usr_pno_input = window.intlTelInput(user_input);
    var biz_input = document.querySelector("#biz_pno_input");
    window.biz_pno_input = window.intlTelInput(biz_input);
    get_profile();
    $("#signout_btn").click(signout);
};

/*
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
};*/

/*08033953050
  08085221450*/

/*function previewImage(input) {
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
};*/

function get_profile(){

  if(isNullOrUndefinedOrEmpty(localStorage["uid"])){
    window.location = "index.html";
  }else{
    var endpoint = "/get_profile/" + localStorage["uid"];
    if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
      
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
        if(!window.user_json["isAdmin"]){
          if(!window.user_json["isBusiness"]){
            if(!window.user_json["isStaff"]){
              window.location = "index.html";
              localStorage["authorization"] = null;
              window.user_json = null;
            }
          }
        }
        window.authorization = data["authorization"];
        populate_user_view();
        if(window.user_json["isAdmin"] || window.user_json["isAdmin"] == "true"){
          get_users();
        }else if(window.user_json["isStaff"] || window.user_json["isStaff"] == "true"){
          get_company_staffs();
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};

function toEpoch(strDate){
  var datum = Date.parse(strDate);
  return datum/1000;
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

      if(typeof window.user_json["isAdmin"] == "string" && window.user_json["isAdmin"].trim() == "true"){
        $("#add_biz_tab").removeClass("invisible");
        $("#my_profile_tab").click();
      }else{
        if(window.user_json["isAdmin"]){
          $("#add_biz_tab").removeClass("invisible");
          $("#my_profile_tab").click();
        }else{
          $("#add_biz_tab").addClass("invisible");
          $("#my_profile_tab").click();
        }
      }

    document.getElementById("my_report_tab").innerHTML = "";
    var acts = window.user_json["activities"];
    if(!isNullOrUndefinedOrEmpty(acts)){
      Object.keys(acts).forEach(function(key) {
        var a_view = window.report1 + acts[key]["description"] + window.report3 +
          acts[key]["epoch"] + window.report5;
          a_view = a_view.replaceAll("activity_id", acts[key]["id"]);
        document.getElementById("my_report_tab").innerHTML = document.getElementById("my_report_tab").innerHTML + a_view
        //$("#" + acts[key]["id"] + "_btn").click(activity_dropdown);
      });

      Object.keys(acts).forEach(function(key) {
        $("#" + acts[key]["id"] + "_btn").click(activity_dropdown);
      });

      if(document.getElementById("my_report_tab").innerHTML == ""){
        $("#my_report_tab").append("<br> No record for user");
      }
    }
    
    
};

var activity_dropdown = function(e){
  var href = $(this).attr('href');
  if($(href).hasClass("show")){
    $(href).removeClass("show");
  }else{
    $(href).addClass("show");
  }
}

/*function populate_industry(){
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
};*/

var signin = function(){

  reset_all_span();
  var endpoint = "/auth/signin"
  if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
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
        window.location = "admin_user.html";
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
};

function get_users(){
  if( isNullOrUndefinedOrEmpty(localStorage["authorization"])){
    window.location = "index.html";
  }else{
    var endpoint = "/get_users";
    if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
      
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

function get_company_staffs(){
  if( isNullOrUndefinedOrEmpty(localStorage["authorization"])){
    window.location = "index.html";
  }else{
    var endpoint = "/company/get_users";
    if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
      
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


/*document.getElementById("my_report_tab").innerHTML = "";
    var acts = window.user_json["activities"];
    if(!isNullOrUndefinedOrEmpty(acts)){
      Object.keys(acts).forEach(function(key) {
        var a_view = window.report1 + acts[key]["description"] + window.report3 +
          acts[key]["epoch"] + window.report5;
          a_view = a_view.replaceAll("activity_id", acts[key]["id"]);
        document.getElementById("my_report_tab").innerHTML = document.getElementById("my_report_tab").innerHTML + a_view
        //$("#" + acts[key]["id"] + "_btn").click(activity_dropdown);
      });

      Object.keys(acts).forEach(function(key) {
        $("#" + acts[key]["id"] + "_btn").click(activity_dropdown);
      });

      if(document.getElementById("my_report_tab").innerHTML == ""){
        $("#my_report_tab").append("<br> No record for user");
      }
    }
    
    
};

var activity_dropdown = function(e){
  var href = $(this).attr('href');
  if($(href).hasClass("show")){
    $(href).removeClass("show");
  }else{
    $(href).addClass("show");
  }
}*/

function populate_users_view(){
  
  document.getElementById("users_card").innerHTML = "";
  Object.keys(window.users).forEach(function(key) {
    var u_view = window.user1 + window.users[key]["displayName"] + window.user3 +
      window.users[key]["email"] + window.user5 + window.users[key]["phoneNumber"] + window.user7 + 
      window.users[key]["industry"] + window.user9;
      u_view = u_view.replaceAll("user_id", key);
    document.getElementById("users_card").innerHTML = document.getElementById("users_card").innerHTML + u_view;
  });

  Object.keys(window.users).forEach(function(key) {
    $("#" + key + "_btn").click(user_dropdown);
    $('#' + key + "_cbdiv").click(clicked_user);
    //$('#' + key + "_chref").click(chat);
    //$('#' + key + "_dhref").click(disable_user);
    //$('#' + key + "_rshref").click(reset_password);
  });

  if(document.getElementById("users_card").innerHTML == ""){
    $("#users_card").append("<br> No record for user");
  }
};


var user_dropdown = function(e){
  var href = $(this).attr('href');
  if($(href).hasClass("show")){
    $(href).removeClass("show");
  }else{
    $(href).addClass("show");
  }
}

var clicked_user = function(e){
  var id = $(this).attr('id');
  id = id.replaceAll("_cbdiv", "");
  Object.keys(window.users).forEach(function(key) {
    if(key == id){
      //localStorage["sub_details0"] = window.organizations[key];
      var user = window.users[key];
      $("#usr_fn_input").val(user['displayName'].split(" ")[0]);
      $("#usr_ln_input").val(user['displayName'].split(" ")[1]);
      $("#usr_password_input").val(user['password']);
      $("#usr_bvn_input").val(user['bvn']);

      if( isNullOrUndefinedOrEmpty(user['email'])){
       $("#usr_email_input").val(""); 
      }else{
        $("#usr_email_input").val(user['email']);
      }
      if(!isNullOrUndefinedOrEmpty(user['phoneNumber'])){
        window.usr_pno_input.setNumber(user['phoneNumber']);
      }else{
        window.usr_pno_input.setNumber('');
      }

      opt = document.createElement('OPTION');
      opt.textContent = user['industry'];
      document.getElementById('usr_industry_group').appendChild(opt);
    }
  })
}

var reset_password = function(e){
  
}

var disable_user = function(e){
  
}

var chat = function(e){
  
}

function post_error(error){
  var endpoint = "/report_error";
  if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
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
    if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }

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

function add_business(){
  if( isNullOrUndefinedOrEmpty(localStorage["authorization"])){
    window.location = "index.html";
  }else{
    reset_all_span();
    var endpoint = "/register_business";
    if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
    window.cb_details = {
      'displayName' : $("#biz_fn_input").val() + " " + $("#biz_ln_input").val(),
      'industry' : $('#biz_industry_input option:selected').text(),
      'password' : "",
      'email' : $("#biz_email_input").val(),
      //'phoneNumber' : $("#pno_input").intlTelInput("getNumber"),
      'phoneNumber' : biz_pno_input.getNumber(),
      'photoURL' : "",
      'business_name' : $("#biz_name_input").val()
    }

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": host+endpoint,
        "method": "POST",
        "contentType": "application/json",
        "dataType": "json",
        "headers": {
          "authorization" : localStorage["authorization"],
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(window.cb_details)
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