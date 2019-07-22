var host = window.location.href.slice(0, window.location.href.lastIndexOf("/"));

document.addEventListener('DOMContentLoaded', function() {
  var site = window.location.href+"";
  
  if(site.endsWith("pay.html") || site.indexOf("pay.html")>-1){
    get_profile();
    $("#payment_form").submit(pay_redirect);
  }
});

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
        localStorage["authorization_data"] = data;
        window.location = data["authorization_url"];
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
    console.log(response);
  });
}