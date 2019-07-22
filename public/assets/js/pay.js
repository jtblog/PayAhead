document.addEventListener('DOMContentLoaded', function() {
  var site = window.location.href+"";
  
  if(site.endsWith("pay.html") || site.indexOf("pay.html")>-1){
    //$("#login_form").submit(signin);
    payWithPayStack();
  }
});


function payWithPayStack(){
  var handler = PaystackPop.setup({
      key: 'pk_test_e7ea4eef9e85c26ac13c834a249f077a7d3780d4',
      email: 'customer@email.com',
      amount: 10000,
      currency: "NGN",
      firstname: 'Stephen',
      lastname: 'King',
      container: 'payEmbedContainer',
      // label: "Optional string that replaces customer email"
      metadata: {
        custom_fields: [
          {
              display_name: "Mobile Number",
              variable_name: "mobile_number",
              value: "+2348012345678"
          }
        ]
    },
    callback: function(response){
        alert('success. transaction ref is ' + response.reference);
    },
    onClose: function(){
        //alert('window closed');
    }
  });
  handler.openIframe();

  //setTimeout(window.prepare_firebase, 3000);

  
}