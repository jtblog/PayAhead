var host = window.location.href.slice(0, window.location.href.lastIndexOf("/"));

var authorization, user_json;
var cre_ac_cntr, cre_ac_frm, vrfy_otp_frm;

var organizations = {}; 
var users = {};
var transactions = {};

var botMessage = '<div class="botui-message message_id_msg"><div class = "message_id_msg"><div class="botui-message-content text message_id_msg"><span id="message_id_msg">message_content</span></div></div></div>';
var humanMessage = '<div class="botui-message message_id_msg"><div class = "message_id_msg"><div class="human botui-message-content text message_id_msg"><span id="message_id_msg">message_content</span></div></div></div>';
var selected_messages = [];

window._prepare = function(){
  $('iframe').remove();
  $(".copyright").html("PayAhead © " + new Date().getFullYear());
  var site = window.location.href + "";

  if(site.indexOf("?") > -1){
    window.location = site.split("?")[0];
  }else if(site.indexOf("#") > -1){
    window.location = site.split("#")[0];
  }else if(site.indexOf("admin_user") > -1){
    $("#create_user_form").submit(function(e){e.preventDefault();});
    $("#update_form").submit(function(e){e.preventDefault();});
    $("#create_user_btn").click(addOrUpdateUser);
    $("#update_btn").click(update_profile);

    usr();
    $("#create_biz_form").submit(function(e){e.preventDefault();});
    $("#create_biz_btn").click(add_business);
    populate_industry();
    setInputFilter(document.getElementById("biz_pc_input"), function(value) {
        return /^\d*$/.test(value);
    });
  }
    
  if(!isNullOrUndefinedOrEmpty($("#login_form"))){
    $("#login_form").submit(function(e){e.preventDefault();});
    $("#admin_signin_btn").click(signin);
    try{
      $("#emailv_a").click(send_email_verification);
    }catch(e){}
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

function usr(){
  prepare_ui();
  var input = document.querySelector("#pno_input");
    window.pno_input = window.intlTelInput(input);
    var user_input = document.querySelector("#usr_pno_input");
    window.usr_pno_input = window.intlTelInput(user_input);
    var biz_input = document.querySelector("#biz_pno_input");
    window.biz_pno_input = window.intlTelInput(biz_input);
    $("#signout_btn").click(signout);
    $("#profile_pic").click(function(e){$("#pic_input").click();});
    $('#pic_input').on('change', function() {
        previewImage(this);
    });
    preset();
};

/*08033953050
  08085221450*/

function previewImage(input) {
  if (input.files || input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      if(typeof(document.getElementById('profilepic')) != undefined){
        //document.getElementById('profilepic').src = e.target.result;
        $('#profile_pic').attr('src', e.target.result);
        window.profilePicture = input.files[0];
      }
    };
  reader.readAsDataURL(input.files[0]);
  }
};

var addOrUpdateUser = function(e){
  e.preventDefault();
  reset_all_span();
  var endpoint = "/auth/updateOrCreateUser";
  if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
  }

  if(isNullOrUndefinedOrEmpty(window.selected_user)){
    window.selected_user = {};
  }

  window.au_details = {
    'displayName' : $("#usr_fn_input").val() + " " + $("#usr_ln_input").val(),
    'industry' : $('#usr_industry_input option:selected').text(),
    'password' : $("#usr_password_input").val(),
    'bvn' : $("#usr_bvn_input").val(),
    'email' : $("#usr_email_input").val(),
    'branch' : $("#usr_branch_input").val(),
    'phoneNumber' : usr_pno_input.getNumber(),
    'photoURL' : $("#usr_img").attr("src"),
    'addedBy' : window.user_json["uid"],
    'business_name' : window.user_json["business_name"]
  }

  if(!$("#usr_img").attr("src").indexOf("firebase") > -1){
    window.au_details["photoURL"] = "";
  }

  window.selected_user["newdata"] = window.au_details;

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
      "data": JSON.stringify(window.selected_user)
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        $("#usr_error_span").text("Successfull");
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        populate_industry();
        var error = JSON.parse(jqXHR.responseText);
        handle_user_error(error);
      });
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
        if(!host.endsWith("/admin")){
            endpoint = "/admin" + endpoint;
        }

        window.up_details = {
          'displayName' : $("#fn_input").val() + " " + $("#ln_input").val(),
          'industry' : $('#industry_input option:selected').text(),
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
    if(!host.endsWith("/admin")){
        endpoint = "/admin" + endpoint;
    }

    window.up_details = {
      'displayName' : $("#fn_input").val() + " " + $("#ln_input").val(),
      'industry' : $('#industry_input option:selected').text(),
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

function get_profile(){

  $('iframe').remove();
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
        }else if(window.user_json["isStaff"] || window.user_json["isBusiness"]){
          get_company_staffs();
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};

function preset(){
  if(isNullOrUndefinedOrEmpty(localStorage["uid"])){
    window.location = "index.html";
  }else{
    var endpoint = "/get_credentials";
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
        firebase.initializeApp(data.preset);
        window.db = firebase.database();
        window.db.ref(data.refEndpoint).on("value", function(data) {
            get_profile();
        });
        /*db.ref(data.refEndpoint.split("/")[0]).on("value", function(data) {
            get_profile();
        });*/
        try{
          window.last_clicked.click();
        }catch(e){};
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
}

function toEpoch(strDate){
  var datum = Date.parse(strDate);
  return datum / 1000;
}

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

function populate_user_view(){
  $(".profile-name").html(window.user_json['displayName']);
      $("#profile_pic").attr("src", window.user_json["photoURL"]);
      $("#fn_input").val(window.user_json['displayName'].split(" ")[0]);
      $("#ln_input").val(window.user_json['displayName'].split(" ")[1]);
      $("#password_input").val(window.user_json['password']);
      $("#bvn_input").val(window.user_json['bvn']);
      if(window.user_json["isStaff"]){
        if(!isNullOrUndefinedOrEmpty(window.user_json["branch"])){
          $("#branch_input").val(window.user_json["branch"]);
        }
        $("#branch_input").attr("disabled", "disabled");
      }else{
        if(!isNullOrUndefinedOrEmpty(window.user_json["branch"])){
          $("#branch_input").val(window.user_json["branch"]);
        }
      }

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

    var act_template = document.getElementById("activity_id_card-body").outerHTML;
    document.getElementById("reports_card").innerHTML = "";
    var acts = window.user_json["activities"];
    if(!isNullOrUndefinedOrEmpty(acts)){
      Object.keys(acts).forEach(function(key) {
        var a_view = act_template.replaceAll("activity_id", acts[key]["id"]);
        a_view = a_view.replaceAll("collapse-1", acts[key]["id"]);
        a_view = a_view.replaceAll("invisible", "");
        document.getElementById("reports_card").innerHTML = document.getElementById("reports_card").innerHTML + a_view;
      });
    }
    document.getElementById("reports_card").innerHTML = document.getElementById("reports_card").innerHTML + act_template;
    if(!isNullOrUndefinedOrEmpty(acts)){
      Object.keys(acts).forEach(function(key) {
        $("#" + acts[key]["id"] + "_btn").text(acts[key]["description"]);
        $("#" + acts[key]["id"] + "_btn").click(_dropdown);
        $("#" + acts[key]["id"] + "_ephlbl").html( toDate(acts[key]["epoch"]) );
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
}

var send_email_verification = function(){
  reset_all_span();
  var endpoint = "/resend_email_verification"
  if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
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
        $("#emailv_a").addClass("invisible");
        $("#error_span").html("A verification link has been sent to your email address");
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
};

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
        if(!isNullOrUndefinedOrEmpty(data["redirect"])){
          window.location = data["redirect"];
        }
        if(!isNullOrUndefinedOrEmpty(data["user"])){
          localStorage["uid"] = data["user"]["uid"];
          localStorage["authorization"] = data["authorization"];
          window.location = "admin_user.html";
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
};

function get_users(){
  window.selected_user = {};
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
        "authorization" : localStorage["authorization"]
      }
    }

    $.ajax(settings)
      .done(function (response) {
        var data = response;
        window.users = data;
        populate_users_view();
        chat_modal_handler();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
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
        console.log(jqXHR.responseText);
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

var forgot_password = function(e){
};

var disable_user = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  var txt = $(this).html().trimmer();
  id = id.replaceAll("_dhref", "");
  Object.keys(window.users).forEach(function(key) {
    if(key == id){
      var user = window.users[key];
      switch(txt){
        case "disableuser" :
          user["newdata"] = { "disabled" : true};
          break;
        case "enableuser" :
          user["newdata"] = { "disabled" : false}
          break;
      }

      var endpoint = "/auth/disableUser";
      if(!host.endsWith("/admin")){
          endpoint = "/admin" + endpoint;
      }
    
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
          "data": JSON.stringify(user)
        }

        $.ajax(settings)
          .done(function (response) {
            var data = response;
            window.location = "admin_user.html";
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            //populate_industry();
            var error = JSON.parse(jqXHR.responseText);
            try{
              alert(error.message);
            }catch(e){ console.log(e); }
            
            //handle_user_error(error);
          });
    }
  })
};

var delete_user = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_dlhref", "");
  window.selected_user = window.users[id];
  var pURL = window.selected_user["photoURL"];

  var endpoint = "/auth/deleteUser";
  if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
  }

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
      "data": JSON.stringify(window.selected_user)
    }

    $.ajax(settings)
      .done(function (response) {
        var storageRef = firebase.storage();
        storageRef.refFromURL(pURL).delete();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var error = JSON.parse(jqXHR.responseText);
        try{
          alert(error.message);
        }catch(e){ console.log(e); }
      });
}

var chat = function(e){
  e.preventDefault();
  window.last_clicked = $(this);
  var id = $(this).attr('id');
  id = id.replaceAll("_chref", "");

  window.chat_ui = null;
  $("#chat_body").html("<bot-ui></bot-ui>");
  window.chat_ui = new BotUI("chat_body");
  
  window.selected_user = window.users[id];
  localStorage["chateeId"] = id;
  localStorage["chatee"] = window.users[id]["displayName"];
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
}

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
    "seen" : false,
    "epochSent" : Date.now()
  }
  Object.keys(res).forEach(function(key) {
    _c[key] = res[key];
  });
  if(isNullOrUndefinedOrEmpty(_c["recieverId"])){
    _c["recieverId"] = localStorage["chateeId"];
    _c["reciever"] = localStorage["chatee"];
  }
  if(!isNullOrUndefinedOrEmpty(_c["recieverId"])){
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
        var my_msg = window.humanMessage.replaceAll("message_id", _c["epochSent"]).replaceAll("message_content", _c["content"]);
        $(".botui-messages-container").append(my_msg);
        window.chat_ui.action.text({
            autoHide: true,
            addMessage: false,
            action: {
              placeholder: 'Type here'
            }
          }).then(save_chat);
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
  }else{
    $("#chat_error_lbl").html("Error sending message. Please try again");
    window.chat_ui.action.text({
        autoHide: true,
        addMessage: false,
        action: {
          placeholder: 'Type here'
        }
      }).then(save_chat);
  }
  
}

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
  /*if(window.message_longpressed){
    if(window.selected_messages.length == 1){
      if($.inArray(id, window.selected_messages) > -1){
        //window.selected_messages.pop(id); 
        //$(this).parent().parent().parent().css('background-color', 'white');
        //$("#chatee_profileUi").removeClass("invisible");
        //$("#chat_longclicked").addClass("invisible");
        window.message_longpressed = false;
      }else{
        window.selected_messages.push(id); 
        $(this).parent().parent().parent().css('background-color', 'aqua');
      }
    }else if(window.selected_messages.length > 1){
      window.selected_messages.push(id); 
      $(this).parent().parent().parent().css('background-color', 'aqua');
    }
  }*/
}

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
}

var delete_messages = function(e){
  //localStorage["last_chat_with"] = window.selected_user["uid"];
  for(var i=0; i < window.selected_messages.length; i++){
    var path = "users/" + user_json["uid"] + "/conversations/" + window.selected_user["uid"] + "/" + window.selected_messages[i];
    window.db.ref(path).remove();
  }
}

var popup_pic = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_img", "");

  window.selected_user = window.users[id];
  try{clicked_user();}catch(e){}

  $("#u_img").attr("src", window.selected_user["photoURL"]);
  $("#img_modal").modal("show");
}

var clicked_user = function(e){
  e.preventDefault();
  window.last_clicked = $(this);
  var id = $(this).attr('id');
  if(id.endsWith("_cbdiv")){
    id = id.replaceAll("_cbdiv", "");
  }else if(id.endsWith("_card-body")){
    id = id.replaceAll("_card-body", "");
  }
  
  var isCurrentUser = false;
  Object.keys(window.users).forEach(function(key) {
    if(key == id){
      window.selected_user = window.users[key];
    }
    if(key == id && id == window.user_json["uid"]){
      isCurrentUser = true;
    }
  });

  if(!isNullOrUndefinedOrEmpty(window.selected_user)){
    if(!isCurrentUser){
      $("#usr_img").attr("src", window.selected_user['photoURL']);
      $("#usr_fn_input").val(window.selected_user['displayName'].split(" ")[0]);
      $("#usr_ln_input").val(window.selected_user['displayName'].split(" ")[1]);
      //$("#usr_password_input").val(user['password']);
      $("#usr_bvn_input").val(window.selected_user['bvn']);

      if(isNullOrUndefinedOrEmpty(window.selected_user['email'])){
       $("#usr_email_input").val(""); 
      }else{
        $("#usr_email_input").val(window.selected_user['email']);
      }
      if(!isNullOrUndefinedOrEmpty(window.selected_user['phoneNumber'])){
        window.usr_pno_input.setNumber(window.selected_user['phoneNumber']);
      }else{
        window.usr_pno_input.setNumber('');
      }

      $("#usr_industry_input").val(window.selected_user['industry'].trimmer()).change();
    }



    /* User's activities */
    var acts = window.selected_user["activities"];
    $("#usr_reports_card").empty();
    if(!isNullOrUndefinedOrEmpty(acts)){
      Object.keys(acts).forEach(function(key) {
        add_usr_reportUi(acts[key]);
      });
    }

    try{
      window.usr_save_act_datatable = $('#usr_save_act_table').DataTable( { 
          destroy: true,
          "search": { "regex": true },
          stateSave: false,
          dom: 'Bfrtip',
          buttons: [
              'excelHtml5', 'csvHtml5', 'pdfHtml5'//, 'copyHtml5'
          ]
      });
      /*$('#start_date3, #end_date3').on('dp.change', function(e){
        var min0 = parseInt( $("#start_date3").data("DateTimePicker").date().valueOf() );
        var max0 = parseInt( $("#end_date3").data("DateTimePicker").date().valueOf() );
        var regEx = getRegex(min0, max0);
        window.usr_save_act_datatable.column(0).search(regEx, true, true).draw();
      });*/
      $('#start_date3, #end_date3').on("click keypress", function(e){
        var min3 = toEpoch( $("#start_date3").val() );
        var max3 = toEpoch( $("#end_date3").val() );
        var regEx = getRegex(min3, max3);
        window.usr_save_act_datatable.column(0).search(regEx, true, true).draw();
      });
    }catch(e){ console.log(e); }




    /* User's transactions */
    var trans = window.selected_user["transactions"];
    $("#usr_transactions_card").empty();
    if(!isNullOrUndefinedOrEmpty(trans)){
      Object.keys(trans).forEach(function(key) {
        add_usr_transactionUi(trans[key]);
      });
    }

    try{
      window.usr_save_pay_datatable = $('#usr_save_pay_table').DataTable( { 
          destroy: true,
          "search": { "regex": true },
          stateSave: false,
          dom: 'Bfrtip',
          buttons: [
              'excelHtml5', 'csvHtml5', 'pdfHtml5'//, 'copyHtml5'
          ]
      });
      /*$('#start_date4, #end_date4').on('dp.change', function(e){
        var min1 = parseInt( $("#start_date4").data("DateTimePicker").date().valueOf() );
        var max1 = parseInt( $("#end_date4").data("DateTimePicker").date().valueOf() );
        var regEx = getRegex(min1, max1);
        window.usr_save_pay_datatable.column(0).search(regEx, true, true).draw();
      });*/
      $('#start_date4, #end_date4').on("click keypress", function(e){
        var min4 = toEpoch( $("#start_date4").val() );
        var max4 = toEpoch( $("#end_date4").val() );
        var regEx = getRegex(min4, max4);
        window.usr_save_pay_datatable.column(0).search(regEx, true, true).draw();
      });
    }catch(e){ console.log(e); }
    

    
  }
};

function getRegex(minValue, maxValue){
  var _res = RegNumericRange(minValue, maxValue, {
    MatchWholeWord: false,
      MatchWholeLine: false,
      MatchLeadingZero: false,
      showProcess: false
    }).generate(function(result){
      if(result.success){
          $('#message').empty();
          return result.data.pattern;
      }else{
          $('#message').html('<div class="error">'+result.message+'</div>');
          return "";
      }
  });
    return _res;
}

var verify = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_vhref", "");
  var tran = {};
  Object.keys(window.selected_user["transactions"]).forEach(function(key) {
    if(id == window.selected_user["transactions"][key]["paymentId"]){
      tran = window.selected_user["transactions"][key];
    }
  });
  localStorage["sub_details1"] = JSON.stringify(tran);
  $("#verifier_modal").modal("show");
  $("#verifier_error").text("");

  $("#verifier_btn").click(function(e){
    $("#verifier_error").text("");
    if($("#verifier_input").val() == JSON.parse(localStorage["sub_details1"])["paymentId"]){
      $("#verifier_error").text("");

      var tran = JSON.parse(localStorage["sub_details1"]);
      if(tran["condition"] == "verified"){
        $("#verifier_error").text("Payment has already been verified");
      }else{
        
        var endpoint = "/payment/get_paystack_keys";
        if(!host.endsWith("/admin")){
          endpoint = "/admin" + endpoint;
        }
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

          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://api.paystack.co/transaction/verify/" + tran["reference"],
            "method": "GET",
            "contentType": "application/json",
            //"dataType": "json",
            "headers" : {
              //"Content-Type": "application/json",
              "Authorization" : "Bearer " + data["s_key"]
            }
          }

          $.ajax(settings)
            .done(function (response) {
              var data = response["data"];

              var endpoint = "/payment/update_transaction";
              if(!host.endsWith("/admin")){
                endpoint = "/admin" + endpoint;
              }

              if(!isNullOrUndefinedOrEmpty(data)){
                Object.keys(data).forEach(function(key) {
                  tran[key] = data[key];
                });
              }

              tran["verifiedAt"] = window.user_json["branch"];
              tran["verifiedBy"] = window.user_json["displayName"];
              tran["verifierId"] = window.user_json["uid"];
              tran["epochVerified"] = Date.now();
              tran["epochLatest"] = tran["epochVerified"];
              tran["condition"] = "verified";
              tran["seen"] = false;

              var settings = {
                  "async": true,
                  "crossDomain": true,
                  "url": host+endpoint,
                  "method": "POST",
                  "contentType": "application/json",
                  "dataType": "json",
                  "headers" : {
                    "Content-Type": "application/json",
                    "authorization" : window.authorization
                  },
                  "data": JSON.stringify(tran)
                }

                $.ajax(settings)
                  .done(function (response) {
                    var data = response;
                    localStorage["sub_details1"] = "";
                    $("#verifier_error").text("Verification Successfull");
                    $("#verifier_modal").modal("hide");
                  })
                  .fail(function(jqXHR, textStatus, errorThrown) {
                    var error = JSON.parse(jqXHR.responseText);
                    $("#verifier_error").text("Could not verify payment. Please try again later");
                    errorHandler(error);
                  });

            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              var error = JSON.parse(jqXHR.responseText);
              errorHandler(error);
            });
        });

      }
      
    }else{
      $("#verifier_error").text("Invalid ID. Cannot verify payment");
    }
  });
};

var refund = function(e){
  e.preventDefault();
  var id = $(this).attr('id');
  id = id.replaceAll("_rfhref", "");
  var tran = {};
  Object.keys(window.selected_user["transactions"]).forEach(function(key) {
    if(id == window.selected_user["transactions"][key]["paymentId"]){
      tran = window.selected_user["transactions"][key];
    }
  });

  if(tran["condition"] == "refunded"){
    alert("Payment has already been refunded");
  }else{
    var endpoint = "/payment/get_paystack_keys";
    if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
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

      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.paystack.co/refund",
        "method": "POST",
        "contentType": "application/json",
        "dataType": "json",
        "headers" : {
          "Content-Type": "application/json",
          "Authorization" : "Bearer " + data["s_key"]
        },
        "data" : JSON.stringify({"transaction" : tran["reference"]})
      }

      $.ajax(settings)
        .done(function (response) {
          var data = response["data"];

          var endpoint = "/payment/update_transaction";
          if(!host.endsWith("/admin")){
            endpoint = "/admin" + endpoint;
          }

          if(!isNullOrUndefinedOrEmpty(data)){
            Object.keys(data).forEach(function(key) {
              tran[key] = data[key];
            });
          }
          
          tran["refundedAt"] = window.user_json["branch"];
          tran["refundedBy"] = window.user_json["displayName"];
          tran["refunderId"] = window.user_json["uid"];
          tran["epochRefunded"] = Date.now();
          tran["epochLatest"] = tran["epochRefunded"];
          tran["condition"] = "refunded";
          tran["seen"] = false;

          var settings = {
              "async": true,
              "crossDomain": true,
              "url": host+endpoint,
              "method": "POST",
              "contentType": "application/json",
              "dataType": "json",
              "headers" : {
                "Content-Type": "application/json",
                "authorization" : window.authorization
              },
              "data": JSON.stringify(tran)
            }

            $.ajax(settings)
              .done(function (response) {
                var data = response;
                alert("Refund Successfull");
                window.location = "admin_user.html";
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
    }); 
  }
};

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
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    });
};

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

function addElement(parent, element) {
    parent.appendChild(element);
};

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    if(!isNullOrUndefinedOrEmpty(element)){
      element.parentNode.removeChild(element);
    }
};

function addBefore(new_html, elementId2){
  $(new_html).insertBefore("#"+elementId2);
}

function appendElement(new_html, elementId2){
  $("#"+elementId2).append(new_html);
}

function get_current_location(){
  if (typeof navigator !== "undefined" || typeof navigator.geolocation !== "undefined") {
    //log("Asking user to get their location");
    navigator.geolocation.getCurrentPosition(geolocationCallback, errorHandler);
  } else {
    alert("Your browser does not support location services")
  }
};

function populate_industry(){
  var endpoint = "/db/industries";
  if(!host.endsWith("/admin")){
      endpoint = "/admin" + endpoint;
    }
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": host+endpoint,
    //"contentType": "application/json",
    //"dataType": "json",
    "method": "GET"
  }

  document.getElementById('biz_industry_group').innerHTML = "";
  $.ajax(settings)
    .done(function (response) {
      var data = response;
      for(var i=0; i<data.length; i++){
        opt = document.createElement('OPTION');
        opt.textContent = data[i];
        opt.value = data[i].trimmer();
        document.getElementById('usr_industry_group').appendChild(opt);

        opt = document.createElement('OPTION');
        opt.textContent = data[i];
        opt.value = data[i].trimmer()+"a";
        document.getElementById('biz_industry_group').appendChild(opt);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      var error = JSON.parse(jqXHR.responseText);
      errorHandler(error);
    });
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
      'percentage_charge' : $("#biz_pc_input").val(),
      'photoURL' : "",
      'business_name' : $("#biz_name_input").val(),
      'addedBy' : window.user_json["uid"]
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
          $("#biz_error_span").text("Business Account Created Successfully");
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          populate_industry();
          console.log(jqXHR.responseText);
          var error = JSON.parse(jqXHR.responseText);
          handle_business_error(error);
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
          /*try{
            $("#rspass_a").removeClass("invisible");
          }catch(e){}*/
          break;
      case "auth/user-disabled":
          $("#error_span").html("Your account has been disabled contact administrator");
          break;
      case "auth/email-already-exists":
          $("#email_span").html("Email Address already exists");
          break;
      case "auth/email-not-verified":
          $("#ep_span").html(error.message);
          try{
            $("#emailv_a").removeClass("invisible");
          }catch(e){}
          break;
      case "auth/not-email-or-phone":
          $("#ep_span").html(error.message);
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

var handle_business_error = function(error) {
  try{
    switch(error.code) {
      /*case "auth/weak-password":
          $("#password_span").html(error.message);
          break;*/
      case "auth/email-already-exists":
          $("#biz_email_span").html("Email Address already exists");
          break;
      case "auth/not-email-or-phone":
          $("#biz_email_span").html(error.message);
          break;
      case "auth/invalid-email":
          $("#biz_email_span").html("Invalid email");
          break;
      case "auth/phone-number-already-exists":
          $("#biz_pno_span").html("Phone Number already exist");
          break;
      case "auth/invalid-phone-number":
          $("#biz_pno_span").html("Phone Number is invalid.");
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
          $("#biz_error_span").html(error.message);
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

var handle_user_error = function(error) {
  try{
    switch(error.code) {
      /*case "auth/weak-password":
          $("#password_span").html(error.message);
          break;*/
      case "auth/email-already-exists":
          $("#usr_email_span").html("Email Address already exists");
          break;
      case "auth/not-email-or-phone":
          $("#usr_email_span").html(error.message);
          break;
      case "auth/invalid-email":
          $("#usr_email_span").html("Invalid email");
          break;
      case "auth/phone-number-already-exists":
          $("#usr_pno_span").html("Phone Number already exist");
          break;
      case "auth/invalid-phone-number":
          $("#usr_pno_span").html("Phone Number is invalid.");
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
          $("#usr_error_span").html(error.message);
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

String.prototype.replaceAll = function(search, replaceAllment) {
    var target = this;
    return target.split(search).join(replaceAllment);
};

String.prototype.trimmer = function() {
    var target = this;
    return target.toLowerCase().split(" ").join("");
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
      }else{
        return false
      }
      break;
    };
};

var body_change_listener = function(e){
  $('iframe').remove();
}

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
  //modal_shown();
}

var modal_shown = function(){
  window.top = $("body").scrollTop();
  $("body").css("position", "fixed").css("overflow", "hidden").css("top", -top).css("width", "100%").css("height", top+5000);
}

var modal_hidden = function(){
  window.top =$("body").position().top;
  $("body").css("position", "relative").css("overflow", "auto").css("top", 0).scrollTop(-top);
}

function prepare_ui(){
    $("body").change(body_change_listener);
    $(".close").html('<i class="fa fa-arrow-left" style="font-size: 13px;"></i>');
    $("#profile_pic").attr("src", "");
    $("#usr_img").attr("src", "assets/img/index.png");
    $("#chat_modal").on('show.bs.modal', chat_modal_handler);//.on('hide.bs.modal', modal_hidden);
    $("#del_msgs").click(delete_messages);

    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", "https://js.paystack.co/v1/inline.js");
    document.getElementsByTagName("head")[0].appendChild(script);





    /* All users tab*/
    $("#start_date2").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#end_date2").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#start_date2").val("");
    $("#end_date2").val("");
    $("#users_save_btn").click(function(e){$("#save_users_modal").modal("show");});
    localStorage["user_id_card-body"] = document.getElementById("user_id_card-body").outerHTML;
    removeElement("user_id_card-body");

    /*All user's tab (chat function) */
    //localStorage["chat_longclicked"] = document.getElementById("chat_longclicked").outerHTML
    //localStorage["chatee_profileUi"] = document.getElementById("chatee_profileUi").outerHTML
    //removeElement("chat_longclicked");
    window.chat_ui = new BotUI("chat_body");






    /* User's activities */
    $("#start_date3").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#end_date3").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#start_date3").val("");
    $("#end_date3").val("");
    $("#usr_save_act_btn").click(function(e){$("#usr_save_act_modal").modal("show");});
    //$("#usr_save_act_modal").on('show.bs.modal', modal_shown).on('hide.bs.modal', modal_hidden);
    localStorage["activity_id_card-bodyb"] = document.getElementById("activity_id_card-bodyb").outerHTML;
    localStorage["activity_id_trb"] = document.getElementById("activity_id_trb").outerHTML;
    removeElement("activity_id_card-bodyb");
    removeElement("activity_id_trb");





    /* User's transactions */
    $("#start_date4").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#end_date4").datetimepicker({ format:'m/d/Y H:i:s', showSecond: true});
    $("#start_date4").val("");
    $("#end_date4").val("");
    $("#usr_save_pay_btn").click(function(e){$("#usr_save_pay_modal").modal("show");});
    //$("#usr_save_pay_modal").on('show.bs.modal', modal_shown).on('hide.bs.modal', modal_hidden);
    localStorage["payment_id_tr"] = document.getElementById("payment_id_tr").outerHTML;
    localStorage["payment_id_card-body"] = document.getElementById("payment_id_card-body").outerHTML
    removeElement("payment_id_card-body");
    removeElement("payment_id_tr");
}

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
  $('#' + user["uid"] + "_chref").click(chat);
  $('#' + user["uid"] + "_cbdiv").click(clicked_user);
  $('#' + user["uid"] + "_dhref").click(disable_user);
  //$('#' + user["uid"] + "_dlhref").click(delete_user);
  //$('#' + user["uid"] + "_btn").click(_dropdown);
  if(user["disabled"]){
    $('#' + user["uid"] + "_dhref").html("Enable User");
  }else{
    $('#' + user["uid"] + "_dhref").html("Disable User");
  }

  /* User has no subaccount code. Remove pay link */
  if(isNullOrUndefinedOrEmpty(user["subaccount_code"])){
    removeElement(user["uid"] + "_phref");
  }
  /* Only admin  can delete a user*/
  if(!(window.user_json["isAdmin"] || window.user_json["isAdmin"] == "true")){
    removeElement(user["uid"] + "_dlhref");
  }
  /* User is not a staff and therefore has no branch. Remove branch*/
  if(isNullOrUndefinedOrEmpty(user["branch"])){
    removeElement(user["uid"] + "_brchlbl");
  }
  /*User is currently signed in. Remove chat and disable user link*/
  if(user["uid"] == window.user_json["uid"]){
    removeElement(user["uid"] + "_chref");
    removeElement(user["uid"] + "_dhref");
    removeElement(user["uid"] + "_dlhref");
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
}

function add_usr_reportUi(act){
  var a_view = localStorage["activity_id_card-bodyb"].replaceAll("activity_id", act["id"]);
  a_view = a_view.replaceAll("collapse-1", act["id"]+"b");
  a_view = a_view.replaceAll("invisible", "");

  appendElement(a_view, "usr_reports_card");

  $("#" + act["id"] + "_btnb").text(act["description"]);
  $("#" + act["id"] + "_btnb").click(_dropdown);
  $("#" + act["id"] + "_ephlblb").html( toDate(act["epoch"]) );

  try{
    var tr_ua = localStorage["activity_id_trb"].replaceAll("activity_id", act["id"]);
    tr_ua = tr_ua.replaceAll("Cell 1", act["epoch"] );
    tr_ua = tr_ua.replaceAll("Cell 2", window.selected_user["displayName"] );
    tr_ua = tr_ua.replaceAll("Cell 3", toDate(act["epoch"]) );
    tr_ua = tr_ua.replaceAll("Cell 4", act["description"]);
    tr_ua = tr_ua.replaceAll("invisible", "");

    appendElement(tr_ua, "activity_id_tbb");
  }catch(e){ console.log(e); }
}

function add_usr_transactionUi(tran){
  var _id = tran["paymentId"];
            
  var t_view = localStorage["payment_id_card-body"].replaceAll("payment_id", _id);
  t_view = t_view.replaceAll("collapse-1", _id);
  t_view = t_view.replaceAll("invisible", "");

  appendElement(t_view, "usr_transactions_card");

  $("#" + _id + "_idh6").html($("#" + _id + "_idh6").html() + tran["reference"]);
  $("#" + _id + "_toh6").html($("#" + _id + "_toh6").html() + tran["payee"]);
  $("#" + _id + "_byh6").html($("#" + _id + "_byh6").html() + tran["payer"]);
  $("#" + _id + "_amounth6").html($("#" + _id + "_amounth6").html() + (parseFloat(tran["amount"]) / 100) + " NGN");
  $("#" + _id + "_timeh6").html($("#" + _id + "_timeh6").html() + toDate(tran["epochPayed"]) );
  $('#' + _id + "_rfhref").click(refund);
  $('#' + _id + "_vhref").click(verify);
  $("#" + _id + "_btn").click(_dropdown);

  switch(tran["condition"]){
    case "paid":
      $("#" + _id + "_vfrfdlbl").remove();
      break;
    case "verified":
      $('#' + _id + "_vhref").remove();
      $('#' + _id + "_rfhref").remove();
      $("#" + _id + "_vfrfdlbl").html("Verified by " + tran["verifiedBy"] + " on: " + toDate(tran["epochVerified"]) );
      break;
    case "refunded":
      $('#' + _id + "_vhref").remove();
      $('#' + _id + "_rfhref").remove();
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
}

/*function user_claims(){

  if(isNullOrUndefinedOrEmpty(localStorage["uid"])){
    window.location = "index.html";
  }else{
    var endpoint = "/get_user_claims/" + localStorage["uid"];
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
        //console.log(data);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
        var error = JSON.parse(jqXHR.responseText);
        errorHandler(error);
      });
  }
};*/