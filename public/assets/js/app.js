var host = window.location.href.slice(0, window.location.href.lastIndexOf("/"));

var authorization, user_json;
var cre_ac_cntr, cre_ac_frm, vrfy_otp_frm;

var transactions = {};
var reports = {};
var botMessage = '<div class="botui-message message_id_msg"><div class = "message_id_msg"><div class="botui-message-content text message_id_msg"><span id="message_id_msg">message_content</span></div></div></div>';
var humanMessage = '<div class="botui-message message_id_msg"><div class = "message_id_msg"><div class="human botui-message-content text message_id_msg"><span id="message_id_msg">message_content</span></div></div></div>';
var selected_messages = [];

window._prepare = function(){
  $(".copyright").html("PayAhead © " + new Date().getFullYear());
  $("#sin_btn").click(function(e){ e.preventDefault(); window.location = "signin.html";} );
  $("#sup_btn").click(function(e){ e.preventDefault(); window.location = "signup.html";} );
  $("iframe").remove();
  
  var site = window.location.href + "";
  if(site.indexOf("landing") > -1){
    landing();
    $("#bdetails_form").submit(function(e){e.preventDefault();});
  }else if(site.indexOf("signin") > -1){
    $("#signin_form").submit(signin);
    //$("#signin_form").submit(function(e){e.preventDefault();});
    //$("#signin_btn").click(signin);
    $("#rspass_a").click(forgot_password);
    $("#emailv_a").click(re_verify_email);
    if(site.indexOf("?") > -1){
      window.location = site.split("?")[0];
    }else if(site.indexOf("#") > -1){
      window.location = site.split("#")[0];
    }
  }else if(site.indexOf("user") > -1){
    usr();
  }else if(site.indexOf("signup") > -1){
    sgup();
  }else if(site.indexOf("/pay") > -1){
    py();
  }
};

var initApp = function() {
  prepare_dependencies();
};

function toDate(epoch){
  if(isNullOrUndefinedOrEmpty(epoch)){
    return("");
  }else{
    if(typeof epoch == "string"){
      var _str = new Date(parseInt(epoch)).toLocaleString();
      var _d = new Date(parseInt(epoch));
      var rd = _d.getDate()  + "/" + (_d.getMonth()+1) + "/" + _d.getFullYear() + "," + _str.split(",")[1];
      return(rd);
    }else{
      var _str = new Date(epoch).toLocaleString();
      var _d = new Date(epoch);
      var rd = _d.getDate()  + "/" + (_d.getMonth()+1) + "/" + _d.getFullYear() + "," + _str.split(",")[1];
      return(rd);
    }
  }
}

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









function py(){
  if( document.getElementById("amount_input") != undefined){
      setInputFilter(document.getElementById("amount_input"), function(value) {
        return /^\d*$/.test(value);
      });
  }
  /*var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", "https://js.paystack.co/v1/inline.js");
  document.getElementsByTagName("head")[0].appendChild(script);*/
  prepare_for_payment();
  $("#payment_form").submit(pay_popup);
};

function usr(){
  prepare_ui();
  var input = document.querySelector("#pno_input");
    window.pno_input = window.intlTelInput(input);
    preset();
    $("#update_form").submit(function(e){e.preventDefault();});
    $("#signout_btn").click(signout);
    $("#update_btn").click(update_profile);
    $("#profile_pic").click(function(e){$("#pic_input").click();});
    $("#pic_input").on('change', function() {
        previewImage(this);
    });
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

function landing(){
  setInputFilter(document.getElementById("accnum_input"), function(value) {
        return /^\d*$/.test(value);
      });
  $("#npass_form").submit(function(e){e.preventDefault();});
  $("#reset_btn").click(reset_password);

  var urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('oobCode')){
    window.actionCode = urlParams.get('oobCode');
  }
  if(urlParams.has('mode')){
    window.mode = urlParams.get('mode');
  }
  if(urlParams.has('secret')){
    window.authorization = urlParams.get('secret');
    window.bname = urlParams.get('business_name');
    window.id = urlParams.get('id');
    window.pc = urlParams.get('agreement');
  }

  if(!isNullOrUndefinedOrEmpty(window.actionCode)){
    var endpoint = "/verify_actioncode";
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
        "data": JSON.stringify({ "actionCode" : window.actionCode, "mode" : window.mode })
      }

      $.ajax(settings)
        .done(function (response) {
          var data = response;
          switch(window.mode){
            case 'resetPassword':
              // Display reset password handler and UI.
              $("#rp_tab").click();
              $("#landing_tabs").removeClass("invisible");
              window.sub_details2 = data["email"];
              break;
            case 'recoverEmail':
              // Display email recovery handler and UI.
              break;
            case 'verifyEmail':
              // Display email verification handler and UI.
              $("#ev_tab").click();
              $("#landing_tabs").removeClass("invisible");
              break;
            default:
              // Error: invalid mode.
          }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.responseText);
          var error = JSON.parse(jqXHR.responseText);
          errorHandler(error);
          if(mode == 'resetPassword'){
            alert("Link is either invalid or expired. Reset password again or contact administrator");
          }
        });
  }else{
      
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
        window.ky = data["s_key"];
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "https://api.paystack.co/bank",
          "method": "GET",
          //"contentType": "application/json",
          //"dataType": "json",
          "headers" : {
            //"Content-Type": "application/json",
            "Authorization" : "Bearer " + data["s_key"]
          }
        }

        $.ajax(settings)
          .done(function (response) {
            var data = JSON.parse(JSON.stringify(response))['data'];
            document.getElementById('bkname_group').innerHTML = "";
            for(i=0; i<data.length; i++){
              opt = document.createElement('OPTION');
              opt.textContent = data[i]['name'];
              opt.value = i;
              document.getElementById('bkname_group').appendChild(opt);
            }
            $("#bs_tab").click();
            $("#landing_tabs").removeClass("invisible");
            $("#acc_btn").click(complete_business_reg);
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            var error = JSON.parse(jqXHR.responseText);
            errorHandler(error);
          });
      }); 
  }
};










var complete_business_reg = function(){

  window.acc_details = {
    'business_name' : window.bname,
    'settlement_bank' : $("#bkname_input option:selected").text(),
    'account_number' : $("#accnum_input").val(),
    'percentage_charge' : window.pc
  }

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.paystack.co/subaccount",
    "method": "POST",
    "contentType": "application/json",
    "dataType": "json",
    "headers" : {
      "Content-Type": "application/json",
      "Authorization" : "Bearer " + window.ky
    },
    "data": JSON.stringify(window.acc_details)
  }

  $.ajax(settings)
    .done(function (response) {
      var data = JSON.parse(JSON.stringify(response))['data'];
      data["uid"] = window["id"];
      data["description"] = $("#desc_input").val();
      var endpoint = "/save_business_account";
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": host+endpoint,
        "method": "POST",
        "contentType": "application/json",
        "dataType": "json",
        "headers" : {
          "Content-Type": "application/json",
          "authorization" : window.authorization,
        },
        "data": JSON.stringify(data)
      }

      $.ajax(settings)
        .done(function (response) {
          $("#special_message").html("You have successfully registered a business account with PayAhead");
          $("#ev_tab").click();
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          var error = JSON.parse(jqXHR.responseText);
          errorHandler(error);
        });
      
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      var error = JSON.parse(jqXHR.responseText);
      errorHandler(error);
    });
};

var reset_password = function(e){
  e.preventDefault();
  reset_all_span();
  if($("#npass_input").val()  == $("#cnpass_input").val() ){
    var endpoint = "/confirm_password_reset";
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
      "data": JSON.stringify({ "actionCode" : window.actionCode, "email" : window.sub_details2, "newPassword" : $("#npass_input").val() })
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        document.getElementById('special_message').innerHTML = "Your password has just been set";
        $("#ev_tab").click();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }else{
    try{
      $("#cnpass_span").html("Password do not match");
    }catch(e){}
  }
};

var forgot_password = function(e){
  e.preventDefault();
  reset_all_span();
  var endpoint = "/auth/reset_password"
  window.rsp_details = {
    //'password' : $("#password_input").val(),
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
      "data": JSON.stringify(window.rsp_details)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        $("#password_span").html("A verification link has been sent to your email address");
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
};

var re_verify_email = function(e){
  e.preventDefault();
  reset_all_span();
  var endpoint = "/auth/resend_email_verification"
  window.ev_details = {
    //'password' : $("#password_input").val(),
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
      "data": JSON.stringify(window.ev_details)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        $("#ep_span").html("A verification link has been sent to your email address");
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
};

var signup = function(e){
  e.preventDefault();
  reset_all_span();
  var endpoint = "/auth/signup";
  window.su_details = {
    'displayName' : $("#fn_input").val() + " " + $("#ln_input").val(),
    'industry' : $("#industry_input option:selected").text(),
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

  $("iframe").remove();

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

        if(isNullOrUndefinedOrEmpty(window.user_json["device_token"])){
          allowNotifications();
        }else{
          allowNotifications();
          window.msg_token = window.user_json["device_token"];
        }

        populate_user_view();
        /*get_transactions();*/
        if(!isNullOrUndefinedOrEmpty(window.user_json["transactions"])){
          window.transactions = window.user_json["transactions"];
          populate_transactions_view();
        }
        if(!isNullOrUndefinedOrEmpty(window.user_json["activities"])){
          window.reports = window.user_json["activities"];
          populate_reports_view();
        }
        get_users();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};

function preset(){
  if(isNullOrUndefinedOrEmpty(localStorage["uid"])){
    window.location = "signin.html";
  }else{
    var endpoint = "/get_credentials";
      
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
        firebase.initializeApp(data.preset);
        window.db = firebase.database();
        window.db.ref(data.refEndpoint).on("value", function(data) {
          get_profile();
        });
        /*db.ref(data.refEndpoint.split("/")[0]).on("value", function(data) {
            get_profile();
        });*/

      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
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
      $("#bname_h3").html("Pay " + window.sub_details0["business_name"]);
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
        $("#proceed_btn").removeClass("invisible");
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

        var amt = "" + ($("#amount_input").val() * 100);
        window.sub_details0["amount"] = amt;

        var config = {
          "email" : window.user_json["email"],
          "amount" : amt,
          //"bearer": "account" or "subaccount",
          "subaccount": window.sub_details0["subaccount_code"],
          onClose: function(){
            //alert('Window closed.');
          },
          callback: function(response){
            window.p_response = JSON.parse(JSON.stringify(response));
            window.p_response["epochPayed"] = (new Date).getTime();
            save_t(window.p_response);
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
          //secret["p_key"] = data["p_key"];
          //secret["s_key"] = data["s_key"];
          config["key"] = data["p_key"];
          PaystackPop.setup(config).openIframe();
          /*checkout(secret["s_key"], config);*/
        }); 
      }
  }catch(e){
    console.log(e);
  }
};

var go_to_paymentpage = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_phref", "");
  Object.keys(window.users).forEach(function(key) {
    if(key == id){
      localStorage["sub_details0"] = JSON.stringify(window.users[key]);
      window.location = "pay.html";
    }
  })
};

function allowNotifications(){
  window.msging  = firebase.messaging();
  msging.requestPermission()
    .then(function(){
      return msging.getToken();
    })
    .then(function(token){
      //window.db.
      var endpoint = "/auth/update_profile";

      window.up_details = {
        'device_token' : token
      }
      window.user_json["newdata"] = window.up_details;

      var settings = {
          "async": true,
          "crossDomain": true,
          "url": host+endpoint,
          "method": "POST",
          "contentType": "application/json",
          "dataType": "json",
          "headers": {
            "Content-Type": "application/json",
            "authorization" : window.authorization
          },
          "data": JSON.stringify(window.user_json)
        }

        $.ajax(settings)
          .done(function (response) {
            var data = response;
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            populate_industry();
            var error = JSON.parse(jqXHR.responseText);
            errorHandler(error);
          });

    }).catch(function(err){});

  msging.onMessage(function(payload){
    console.log("onMessage", payload);
  });

};

function save_t(_res){
  var endpoint = "/payment/save_transaction";
  var _p = {
    "reference" : _res.reference,
    "payeeId" : window.sub_details0["uid"],
    "payee" : window.sub_details0["business_name"],
    "payerId" : window.user_json["uid"],
    "payer" : window.user_json["displayName"],
    "amount" : window.sub_details0["amount"],
    "subaccount_code" : window.sub_details0["subaccount_code"],
    "condition" : "paid",
    "epochPayed" : Date.now(),
    "epochLatest" : Date.now(),
    "seen" : false
  }
  Object.keys(_res).forEach(function(key) {
    _p[key] = _res[key];
  });

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
        window.p_response = null;
        console.log(data);
        window.location = "user.html";
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
};

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
};

function populate_user_view(){
  $("#profile_pic").attr("src", window.user_json['photoURL']);
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

  var conversations = window.user_json["conversations"]
  Object.keys(conversations).forEach(function(key) {
    var with_chatee = conversations[key];
    Object.keys(with_chatee).forEach(function(key) {
      if(with_chatee[key]["seen"] == false || isNullOrUndefinedOrEmpty(with_chatee[key]["seen"])){
        if(!isNullOrUndefinedOrEmpty(window.msg_token)){
          var endpoint = "/notification";
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
            "data": JSON.stringify({
              notification: {
            		title: with_chatee[key]["sender"],
            		body: with_chatee[key]["content"]
            	},
            	token: window.msg_token
            })
          }

          $.ajax(settings)
            .done(function (response) {
              var data = response;
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              var error = JSON.parse(jqXHR.responseText);
              console.log(error);
              errorHandler(error);
            });

        }
      }
    });
  });

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
        if(!isNullOrUndefinedOrEmpty(data["redirect"])){
          window.location = data["redirect"];
        }
        if(!isNullOrUndefinedOrEmpty(data["user"])){
          localStorage["uid"] = data["user"]["uid"];
          localStorage["authorization"] = data["authorization"];
          window.location = "user.html";
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        if(error.code.indexOf("wrong-password") > -1 ){
          $("#password_span").html("Incorrect password");
          $("#rspass_a").removeClass("invisible");
        }
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

function populate_users_view(){
  $("#users_card").empty();
  Object.keys(window.users).forEach(function(key) {
    add_userUi(window.users[key]);
  });
};

var chat = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_chref", "");

  window.chat_ui = null;
  $("#chat_body").html("<bot-ui></bot-ui>");
  window.chat_ui = new BotUI("chat_body");
  
  window.selected_user = window.users[id];
  try{clicked_user();}catch(e){}

  $("#chatee_img").attr("src", window.selected_user["photoURL"]);
  $("#chatee_h6").html(window.selected_user["displayName"]);
  $("#chatee_p").html("Last seen at " + toDate(window.selected_user["lastLoginAt"]));
  window.chats = {};
  try{
    chats = window.user_json["conversations"][id];
  }catch(e){};

  window.chat_ui.action.text({
    autoHide: true,
    addMessage: false,
    action: {
      placeholder: 'Type here'
    }
  }).then(save_chat);

  $("#chat_modal").modal("show");
};

var save_chat = function(res){
  //reset_all_span();
  $("#chat_error_lbl").html("");
  var endpoint = "/chat/save_conversation";
  var _c = {
    "content" : res.value,
    "type" : "text",
    "recieverId" : window.selected_user["uid"],
    "reciever" : window.selected_user["displayName"],
    "senderId" : window.user_json["uid"],
    "sender" : window.user_json["displayName"],
    "delivered" : true,
    "read" : false,
    "epochSent" : Date.now(),
    "seen" : false
  }
  Object.keys(res).forEach(function(key) {
    _c[key] = res[key];
  });

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
      "data": JSON.stringify(_c)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.chat_ui.message.human({
          content: res.value
        }).then(function(){
          window.chat_ui.action.text({
            autoHide: true,
            addMessage: false,
            action: {
              placeholder: 'Type here'
            }
          }).then(save_chat);
        });
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
        $("#chat_error_lbl").html("Error sending message. Please try again");
        window.chat_ui.action.text({
            autoHide: true,
            addMessage: false,
            action: {
              placeholder: 'Type here'
            }
          }).then(save_chat);
      });
};

var message_clicked = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_msg", "");

  if($("#chat_longclicked").hasClass("invisible")){
    $("#chat_longclicked").removeClass("invisible");
  }else{
    if($.inArray(id, window.selected_messages) > -1){
      window.selected_messages = window.selected_messages.filter(function(value, index, arr){
        return !(value == id);
      });
      $(this).parent().parent().parent().css('background-color', 'white');
    }else{
      window.selected_messages.push(id); 
      $(this).parent().parent().parent().css('background-color', 'aqua');
    }
  }

  if(window.selected_messages.length == 0){
    $("#chatee_profileUi").removeClass("invisible");
    $("#chat_longclicked").addClass("invisible");
    window.message_longpressed = false;
  }
};

var message_longclicked = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_msg", "");

  if(window.message_longpressed){

  }else{
    $("#chatee_profileUi").addClass("invisible");
    window.selected_messages.push(id); 
    $(this).parent().parent().parent().css('background-color', 'aqua');
    window.message_longpressed = true;
  }

  if(window.selected_messages.length == 0){
    $("#chatee_profileUi").removeClass("invisible");
    $("#chat_longclicked").addClass("invisible");
    window.message_longpressed = false;
  }
};

var delete_messages = function(e){
  localStorage["last_chat_with"] = window.selected_user["uid"];
  for(var i=0; i < window.selected_messages.length; i++){
    var path = "users/" + user_json["uid"] + "/conversations/" + window.selected_user["uid"] + "/" + window.selected_messages[i];
    window.db.ref(path).remove();
  }
};

var popup_pic = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_img", "");

  window.selected_user = window.users[id];
  try{clicked_user();}catch(e){}

  $("#u_img").attr("src", window.selected_user["photoURL"]);
  $("#img_modal").modal("show");
};

var refund = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_rrfhref", "");
  var selected_tran = {};
  Object.keys(window.transactions).forEach(function(key) {
    if(id == window.transactions[key]["paymentId"]){
      selected_tran = window.transactions[key];
    }
  });

  if(!isNullOrUndefinedOrEmpty(selected_tran)){
    var endpoint = "/chat/save_conversation";
    var _c = {
      "content" : "Please, you would do well to refund my payment urgently",
      "type" : "text",
      "recieverId" : selected_tran["payeeId"],
      "reciever" : selected_tran["payee"],
      "senderId" : window.user_json["uid"],
      "sender" : window.user_json["displayName"],
      "delivered" : true,
      "seen" : false
    }
    Object.keys(selected_tran).forEach(function(key) {
      _c[key] = selected_tran[key];
    });
    _c["epochSent"] = Date.now();
    _c["epochLatest"] = _c["epochSent"];

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
        "data": JSON.stringify(_c)
      }

      $.ajax(settings)
        .done(function (response) {
          var data = response;
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          var error = JSON.parse(jqXHR.responseText);
          //errorHandler(error);
        });

      console.log(_c);
  }
};

/*function get_transactions(){
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
};*/

function populate_transactions_view(){
  $("#transactions_card").empty();
  if(!isNullOrUndefinedOrEmpty(window.transactions)){
    Object.keys(window.transactions).forEach(function(key) {
      add_transactionUi(window.transactions[key]);

      if(window.transactions[key]["seen"] == false || isNullOrUndefinedOrEmpty(window.transactions[key]["seen"])){
        if(!isNullOrUndefinedOrEmpty(window.msg_token)){
          var endpoint = "/notification";
          var notf = {
            notification: {
              title: window.transactions[key]["payer"],
              body: ""
            },
          }
          switch(window.transactions[key]["condition"]){
            case "refunded":
                notf.notification.body = "Payment refunded by " + window.transactions[key]["refundedBy"];
              break;
            case "verified":
                notf.notification.body = "Payment verified by " + window.transactions[key]["verifiedBy"];
              break;
            case "refundRequested":
                notf.notification.body = "Refund requested";
              break;
            default:
              notf.notification.body = "Paid " + (parseFloat(window.transactions[key]["amount"]) / 100)  + " NGN"
              break;
          }
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
            "data": JSON.stringify(notf)
          }

          $.ajax(settings)
            .done(function (response) {
              var data = response;
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              var error = JSON.parse(jqXHR.responseText);
              console.log(error);
              errorHandler(error);
            });

        }
      }

    });
  }

  try{
    window.payment_datatable = $("#payment_table").DataTable( { 
        destroy: true,
        "search": { "regex": true },
        stateSave: false,
        dom: 'Bfrtip',
        buttons: [
            'excelHtml5', 'csvHtml5', 'pdfHtml5'//, 'copyHtml5'
        ]
    });
    /*$("#start_date1, #end_date1").on('dp.change', function(e){
      var min1 = parseInt( $("#start_date1").data("DateTimePicker").date().valueOf() );
      var max1 = parseInt( $("#end_date1").data("DateTimePicker").date().valueOf() );
      var regEx = getRegex(min1, max1);
      window.payment_datatable.column(0).search(regEx, true, true).draw();
    });*/
    $("#start_date1, #end_date1").on("click keypress", function(e){
      var min1 = toEpoch( $("#start_date1").val() );
      var max1 = toEpoch( $("#end_date1").val() );
      var regEx = getRegex(min1, max1);
      window.payment_datatable.column(0).search(regEx, true, true).draw();
    });
  }catch(e){ console.log(e); }
};

function populate_reports_view(){
  $("#reports_card").empty();
  if(!isNullOrUndefinedOrEmpty(window.reports)){
    Object.keys(window.reports).forEach(function(key) {
      add_reportUi(window.reports[key]);
    });
  }

  try{
    window.report_datatable = $("#save_act_table").DataTable( { 
        destroy: true,
        "search": { "regex": true },
        stateSave: false,
        dom: 'Bfrtip',
        buttons: [
            'excelHtml5', 'csvHtml5', 'pdfHtml5'//, 'copyHtml5'
        ]
    });
    /*$("#start_date3, #end_date3").on('dp.change', function(e){
      var min3 = parseInt( $("#start_date3").data("DateTimePicker").date().valueOf() );
      var max3 = parseInt( $("#end_date3").data("DateTimePicker").date().valueOf() );
      var regEx = getRegex(min3, max3);
      window.report_datatable.column(0).search(regEx, true, true).draw();
    });*/

    $("#start_date3, #end_date3").on("click keypress", function(e){
      var min3 = toEpoch( $("#start_date3").val() );
      var max3 = toEpoch( $("#end_date3").val() );
      var regEx = getRegex(min3, max3);
      window.report_datatable.column(0).search(regEx, true, true).draw();
    });
  }catch(e){ console.log(e); }
};


function getRegex(minValue, maxValue){
  var _res = RegNumericRange(minValue, maxValue, {
    MatchWholeWord: false,
      MatchWholeLine: false,
      MatchLeadingZero: false,
      showProcess: false
    }).generate(function(result){
      if(result.success){
          $("#message").empty();
          return result.data.pattern;
      }else{
          $("#message").html('<div class="error">'+result.message+'</div>');
          return "";
      }
  });
    return _res;
};

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
};

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
      Object.keys(localStorage).forEach(function(key) {
        localStorage[key] = "";
        localStorage[key] = null;
      });
      window.location = "index.html";
      console.log(response);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      Object.keys(localStorage).forEach(function(key) {
        localStorage[key] = "";
        localStorage[key] = null;
      });
      window.location = "index.html";
    });
  }
};

var update_profile = function(e){
  e.preventDefault();
  reset_all_span();

  if(!isNullOrUndefinedOrEmpty(window.profilePicture)){
    var storageRef = firebase.storage();
    var uploadTask = storageRef.ref('profilePictures/' + window.user_json["uid"]+"."+window.profilePicture["name"].split(".")[1]).put(window.profilePicture);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        /*switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }*/
      }, function(error) {
        errorHandler(error);
      // A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
      /*switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;
        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
      }*/
    }, function() {
      // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        var endpoint = "/auth/update_profile";

        window.up_details = {
          'displayName' : $("#fn_input").val() + " " + $("#ln_input").val(),
          'industry' : $("#industry_input option:selected").text(),
          'password' : $("#password_input").val(),
          'bvn' : $("#bvn_input").val(),
          'email' : $("#email_input").val(),
          'phoneNumber' : pno_input.getNumber(),
          'photoURL' : downloadURL
        }
        window.user_json["newdata"] = window.up_details;

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": host+endpoint,
            "method": "POST",
            "contentType": "application/json",
            "dataType": "json",
            "headers": {
              "Content-Type": "application/json",
              "authorization" : window.authorization
            },
            "data": JSON.stringify(window.user_json)
          }

          $.ajax(settings)
            .done(function (response) {
              var data = response;
              signout();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              populate_industry();
              var error = JSON.parse(jqXHR.responseText);
              errorHandler(error);
            });

      });
    });
  }else{
    var endpoint = "/auth/update_profile";

    window.up_details = {
      'displayName' : $("#fn_input").val() + " " + $("#ln_input").val(),
      'industry' : $("#industry_input option:selected").text(),
      'password' : $("#password_input").val(),
      'bvn' : $("#bvn_input").val(),
      'email' : $("#email_input").val(),
      'phoneNumber' : pno_input.getNumber(),
      'photoURL' : $("#profile_pic").attr("src")
    }
    window.user_json["newdata"] = window.up_details;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": host+endpoint,
        "method": "POST",
        "contentType": "application/json",
        "dataType": "json",
        "headers": {
          "Content-Type": "application/json",
          "authorization" : window.authorization
        },
        "data": JSON.stringify(window.user_json)
      }

      $.ajax(settings)
        .done(function (response) {
          var data = response;
          signout();
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          populate_industry();
          var error = JSON.parse(jqXHR.responseText);
          errorHandler(error);
        });
  }
};













/*function isEmail(str){
  var format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(str.match(format)){
    return true;
  }else{
    return false;
  }
};*/

/*function addElement(parent, element) {
    parent.appendChild(element);
};

function get_current_location(){
  if (typeof navigator !== "undefined" || typeof navigator.geolocation !== "undefined") {
    //log("Asking user to get their location");
    navigator.geolocation.getCurrentPosition(geolocationCallback, errorHandler);
  } else {
    alert("Your browser does not support location services")
  }
};*/

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
          $("#npass_span").html(error.message);
          $("#cnpass_span").html(error.message);
          break;
      case "auth/wrong-password":
          $("#password_span").html("Incorrect password");
          $("#rspass_a").removeClass("invisible");
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
      case "auth/email-not-verified":
          $("#ep_span").html(error.message);
          $("#emailv_a").removeClass("invisible");
          break;
      case "auth/phone-number-already-exists":
          $("#pno_span").html("Phone Number already exist");
          break;
      case "auth/invalid-phone-number":
          $("#pno_span").html("Phone Number is invalid.");
          break;
      case "auth/id-token-expired":
          signout();
          Object.keys(localStorage).forEach(function(key) {
            localStorage[key] = "";
            localStorage[key] = null;
          });
          break;
      case "app/network-error":
          alert("No network");
          Object.keys(localStorage).forEach(function(key) {
            localStorage[key] = "";
            localStorage[key] = null;
          });
          post_error(error);
          signout();
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
  if(!isNullOrUndefinedOrEmpty(textbox)){
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
};

var _dropdown = function(e){
  e.preventDefault();
  var href = $(this).attr('href');
  if($(href).hasClass("show")){
    $(href).removeClass("show");
  }else{
    $(href).addClass("show");
  }
};

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    if(!isNullOrUndefinedOrEmpty(element)){
      element.parentNode.removeChild(element);
    }
};

function addBefore(new_html, elementId2){
  $(new_html).insertBefore("#"+elementId2);
  //var referenceNode = document.getElementById(elementId2);
  //referenceNode.parentNode.insertBefore(newElement, referenceNode);
  //referenceNode.parentNode.appendChild(newElement);
};

function appendElement(new_html, elementId2){
  $("#"+elementId2).append(new_html);
};

function reset_all_span(){
  var allSpans = document.getElementsByTagName('span');
  for(var i = 0; i<allSpans.length; i++){
    if(allSpans[i].childElementCount <= 0){
      allSpans[i].innerHTML = "";
    }
  };
  try{
    $("#emailv_a").addClass("invisible");
  }catch(e){}
  try{
    $("#rspass_a").addClass("invisible");
  }catch(e){}
};

function isNullOrUndefinedOrEmpty(_in){
  var _check = _in;//+"";
  switch(_check){
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
    case {}:
      return true;
      break;
    case []:
      return true;
      break;
    default:
      if(typeof _check == "string"){
        if(_check.trim() == "" || _check.split(" ").join("") == ""){
          return true;
        }else{
          return false;
        }
      }else if(typeof _check == "undefined"){
        return true;
      }else if(_check == {}){
        return true;
      }else{
        return false
      }
      break;
    };
};

String.prototype.replaceAll = function(search, replaceAllment) {
    var target = this;
    return target.split(search).join(replaceAllment);
};

String.prototype.trimmer = function() {
    var target = this;
    return target.toLowerCase().split(" ").join("");
};

function previewImage(input) {
  if (input.files || input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      if(typeof(document.getElementById('profilepic')) != undefined){
        //document.getElementById('profile_pic').src = e.target.result;
        $("#profile_pic").attr('src', e.target.result);
        window.profilePicture = input.files[0];
      }
    };
  reader.readAsDataURL(input.files[0]);
  }
};

function toEpoch(strDate){
  var datum = Date.parse(strDate);
  return datum;
};

var body_change_listener = function(e){
  $("iframe").remove();
};

var chat_modal_handler = function(e){
  $("#chatee_profileUi").removeClass("invisible");
  $("#chat_longclicked").addClass("invisible");
  window.message_longpressed = false;
  
  if(!isNullOrUndefinedOrEmpty(window.chats)){
    $(".botui-messages-container").html("");
    Object.keys(window.chats).forEach(function(key) {
      if(window.chats[key]["senderId"] == window.user_json["uid"]){
        var my_msg = window.humanMessage.replaceAll("message_id", key).replaceAll("message_content", chats[key]["content"]);
        $(".botui-messages-container").append(my_msg);
        document.getElementById(key+"_msg").addEventListener('long-press', message_longclicked);
        $("#"+ key +"_msg").click(message_clicked);

        var els = document.getElementsByClassName(key+"_msg");
        for (var i = 0; i < els.length; i++) {
          els[i].addEventListener('long-press', 
            function(e){
              Object.keys(window.chats).forEach(function(key) {
                if($(this).hasClass(key+"_msg")){
                  $("#"+ key +"_msg").click();
                }
              });
            }
          );
        };
        $("."+ key +"_msg").click(
            function(e){
              Object.keys(window.chats).forEach(function(key) {
                if($(this).hasClass(key+"_msg")){
                  $("#"+ key +"_msg").click();
                }
              });
            }
          );

        
      }else{
        var other_msg = window.botMessage.replaceAll("message_id", key).replaceAll("message_content", chats[key]["content"]);
        $(".botui-messages-container").append(other_msg);
        document.getElementById(key+"_msg").addEventListener('long-press', message_longclicked);
        $("#"+ key +"_msg").click(message_clicked);

        var els = document.getElementsByClassName(key+"_msg");
        for (var i = 0; i < els.length; i++) {
          els[i].addEventListener('long-press', 
            function(e){
              Object.keys(window.chats).forEach(function(key) {
                if($(this).hasClass(key+"_msg")){
                  $("#"+ key +"_msg").click();
                }
              });
            }
          );
        };
        $("."+ key +"_msg").click(
            function(e){
              Object.keys(window.chats).forEach(function(key) {
                if($(this).hasClass(key+"_msg")){
                  $("#"+ key +"_msg").click();
                }
              });
            }
          );
        
      }
    });
  }
};

function prepare_ui(){
    
    $(".close").html('<i class="fa fa-arrow-left" style="font-size: 13px;"></i>');
    $("body").change(body_change_listener);
    $("#profile_pic").attr("src", "");
    $("#chat_modal" ).on('show.bs.modal', chat_modal_handler);
    $("#del_msgs").click(delete_messages);

    /* Payments tab*/
    $("#start_date1").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#end_date1").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#start_date1").val("");
    $("#end_date1").val("");
    $("#save_pays_btn").click(function(e){$("#save_pays_modal").modal("show");});
    localStorage["payment_id_card-body"] = document.getElementById("payment_id_card-body").outerHTML;
    localStorage["payment_id_tr"] = document.getElementById("payment_id_tr").outerHTML;
    removeElement("payment_id_card-body");
    removeElement("payment_id_tr");




    /* All users tab */
    $("#start_date2").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#end_date2").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#start_date2").val("");
    $("#end_date2").val("");
    $("#users_save_btn").click(function(e){$("#save_users_modal").modal("show");});
    localStorage["user_id_card-body"] = document.getElementById("user_id_card-body").outerHTML;
    removeElement("user_id_card-body");

    /*All user's tab (chat function) */
    //localStorage["chat_dbclicked"] = document.getElementById("chat_dbclicked").outerHTML
    //localStorage["chatee_profileUi"] = document.getElementById("chatee_profileUi").outerHTML
    //removeElement("chat_dbclicked");
    window.chat_ui = new BotUI("chat_body");




    /* Reports tab */
    $("#start_date3").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#end_date3").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#start_date3").val("");
    $("#end_date3").val("");
    $("#save_act_btn").click(function(e){$("#save_act_modal").modal("show");});
    localStorage["activity_id_card-body"] = document.getElementById("activity_id_card-body").outerHTML;
    localStorage["activity_id_tr"] = document.getElementById("activity_id_tr").outerHTML;
    removeElement("activity_id_card-body");
    removeElement("activity_id_tr");
};

function add_transactionUi(tran){
  var _id = tran["paymentId"];
            
  var t_view = localStorage["payment_id_card-body"].replaceAll("payment_id", _id);
  t_view = t_view.replaceAll("collapse-1", _id);
  t_view = t_view.replaceAll("invisible", "");

  appendElement(t_view, "transactions_card");

  $("#" + _id + "_rrfhref").click(refund);
  $("#" + _id + "_idh6").html($("#" + _id + "_idh6").html() + tran["paymentId"]);
  $("#" + _id + "_refh6").html($("#" + _id + "_refh6").html() + tran["reference"]);
  $("#" + _id + "_toh6").html($("#" + _id + "_toh6").html() + tran["payee"]);
  $("#" + _id + "_amounth6").html($("#" + _id + "_amounth6").html() + (parseFloat(tran["amount"]) / 100) + " NGN");
  $("#" + _id + "_byh6").html($("#" + _id + "_byh6").html() + tran["payer"]);
  $("#" + _id + "_timeh6").html($("#" + _id + "_timeh6").html() + toDate(tran["epochPayed"]) );
  $("#" + _id + "_btn").click(_dropdown);

  if(window.user_json["isBusiness"] == true || window.user_json["isStaff"] == true || window.user_json["isBusiness"] == "true" || window.user_json["isStaff"] == "true"){
    $("#" + _id + "_idh6").remove();
  }

  switch(tran["condition"]){
    case "paid":
      $("#" + _id + "_vfrfdlbl").remove();
      break;
    case "verified":
      $("#" + _id + "_rrfhref").remove();
      $("#" + _id + "_vfrfdlbl").html("Verified by " + tran["verifiedBy"] + " on: " + toDate(tran["epochVerified"]) );
      break;
    case "refunded":
      $("#" + _id + "_rrfhref").remove();
      $("#" + _id + "_vfrfdlbl").html("Refunded by " + tran["refundedBy"] + " on: " + toDate(tran["epochRefunded"]) );
      break;
    case "refundRequested":
      $("#" + _id + "_vfrfdlbl").html("Refund requested: " + toDate(tran["epochLatest"]) );
      break;
    default:
      $("#" + _id + "_vfrfdlbl").remove();
      break;
  }

  try{
    var tr_up = localStorage["payment_id_tr"].replaceAll("payment_id", _id);
    tr_up = tr_up.replaceAll("Cell 1", tran["epochPayed"]);
    tr_up = tr_up.replaceAll("Cell 2", toDate(tran["epochPayed"]) );
    tr_up = tr_up.replaceAll("Cell 3", tran["payee"]);

    switch(tran["condition"]){
      case "refunded":
        tr_up = tr_up.replaceAll("Cell 4", tran["refundedBy"] + " @ " + tran["refundedAt"]);
        tr_up = tr_up.replaceAll("Cell 5", "Refunded: " + toDate(tran["epochLatest"]));
        break;
      case "verified":
        tr_up = tr_up.replaceAll("Cell 4", tran["verifiedBy"] + " @ " + tran["verifiedAt"]);
        tr_up = tr_up.replaceAll("Cell 5", "Verified: " + toDate(tran["epochLatest"]));
        break;
      case "refundRequested":
        tr_up = tr_up.replaceAll("Cell 4", "---");
        tr_up = tr_up.replaceAll("Cell 5", "Refund Requested: " + toDate(tran["epochLatest"]));
        break;
      default:
        tr_up = tr_up.replaceAll("Cell 4", "---");
        tr_up = tr_up.replaceAll("Cell 5", "---");
        break;
    }

    tr_up = tr_up.replaceAll("invisible", "");

    appendElement(tr_up, "payment_id_tb");
  }catch(e){ console.log(e); }
};

function add_userUi(user){
  var u_view = localStorage["user_id_card-body"].replaceAll("user_id", user["uid"]);
  u_view = u_view.replaceAll("collapse-1", user["uid"]);
  u_view = u_view.replaceAll("invisible", "");

  appendElement(u_view, "users_card");

  $("#" + user["uid"] + "_img").attr("src", user["photoURL"]);
  $("#" + user["uid"] + "_h6").html(user["displayName"]);
  $("#" + user["uid"] + "_elbl").html($("#" + user["uid"] + "_elbl").html() + user["email"]);
  $("#" + user["uid"] + "_phlbl").html($("#" + user["uid"] + "_phlbl").html() + user["phoneNumber"]);
  $("#" + user["uid"] + "_indlbl").html($("#" + user["uid"] + "_indlbl").html() + user["industry"]);
  
  $("#" + user["uid"] + "_img").click(popup_pic);
  $("#" + user["uid"] + "_chref").click(chat);
  $("#" + user["uid"] + "_phref").click(go_to_paymentpage);
  if(user["disabled"]){
    $("#" + user["uid"] + "_card-body").attr("disabled", "disabled");
  }
  

  /* User has no subaccount code. Remove pay link */
  if(isNullOrUndefinedOrEmpty(user["subaccount_code"])){
    removeElement(user["uid"] + "_phref");
  }
  /* User is not a staff and therefore has no branch. Remove branch*/
  if(isNullOrUndefinedOrEmpty(user["branch"])){
    removeElement(user["uid"] + "_brchlbl");
  }
  /*User is currently signed in. Remove chat and disable user link*/
  if(user["uid"] == window.user_json["uid"]){
    removeElement(user["uid"] + "_chref");
  }
  if(!isNullOrUndefinedOrEmpty(user["business_name"])){
    if(user["isBusiness"] || user["isBusiness"] == "true"){
      /* User is a business owner*/
      removeElement(user["uid"] + "_brchlbl");
      $("#" + user["uid"] + "_bnlbl").html($("#" + user["uid"] + "_bnlbl").html() + user["business_name"]);
    }else if(user["isStaff"] || user["isStaff"] == "true"){
      /* User is a staff */
      $("#" + user["uid"] + "_bnlbl").html("Staff Of: " + user["business_name"]);
      $("#" + user["uid"] + "_brchlbl").html($("#" + user["uid"] + "_brchlbl").html() + user["branch"]);
    }else{
      removeElement(user["uid"] + "_brchlbl");
    }
  }else{
    removeElement(user["uid"] + "_bnlbl");
  }

  if(user["uid"] == localStorage["last_chat_with"]){
    window.chats = window.user_json["conversations"][localStorage["last_chat_with"]];
    chat_modal_handler();
    localStorage["last_chat_with"] = null;
  }

};

function add_reportUi(act){
  var a_view = localStorage["activity_id_card-body"].replaceAll("activity_id", act["id"]);
  a_view = a_view.replaceAll("collapse-1", act["id"]);
  a_view = a_view.replaceAll("invisible", "");

  appendElement(a_view, "reports_card");

  $("#" + act["id"] + "_btn").text(act["description"]);
  $("#" + act["id"] + "_btn").click(_dropdown);
  $("#" + act["id"] + "_ephlbl").html( toDate(act["epoch"]) );

  try{
    var tr_ua = localStorage["activity_id_tr"].replaceAll("activity_id", act["id"]);
    tr_ua = tr_ua.replaceAll("Cell 1", act["epoch"] );
    tr_ua = tr_ua.replaceAll("Cell 2", window.user_json["displayName"] );
    tr_ua = tr_ua.replaceAll("Cell 3", toDate(act["epoch"]) );
    tr_ua = tr_ua.replaceAll("Cell 4", act["description"]);
    tr_ua = tr_ua.replaceAll("invisible", "");

    appendElement(tr_ua, "activity_id_tb");
  }catch(e){ console.log(e); }
};

/*function to_postman_JSONstringify_type(_in){
  var strg = JSON.stringify(_in);
  var chunks = ('"' + strg.split('"').join('\\"') + '"').split("'").join('\\"');
  return chunks;
}*/