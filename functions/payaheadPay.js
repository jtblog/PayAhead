var secret_key = 'sk_test_694f6cdba683d71344d254e90077d7ecefad2368';
var paystack = require('paystack')(secret_key);
var _request = require("request");

function payaheadPay() {
}

payaheadPay.prototype.initialize = function (details, _response, mDb) {
	/*paystack.transaction.initialize(
		details
	)
	.then(function(body) {
		response.status(200).json(body.data);
		mDb.set_authorization("last_of_paystack", body.data, response);
	})
	.catch(function(error) {
	  response.status(400).json(error);
	});
	*/

	_request.post({
	   url: 'https://api.paystack.co/transaction/initialize',
	   form: details,
	   headers: { 
	      //'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
	      //'Content-Type' : 'application/x-www-form-urlencoded',
	      'Authorization': 'Bearer ' + secret_key,
	      'Content-Type' : 'application/json'
	   },
	   method: 'POST'
	  },


	  function (error, response, body) {
		  if(error !== null){
		  	_response.status(400).json(error);
		  }else{
		  	//console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		  	_response.status(200).json(JSON.parse(body).data);
		  }
		  
		});

};

module.exports = payaheadPay;