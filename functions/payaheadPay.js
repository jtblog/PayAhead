var secret_key = 'sk_test_694f6cdba683d71344d254e90077d7ecefad2368';
var paystack = require('paystack')(secret_key);

//const axios = require('axios');

function payaheadPay() {
}

payaheadPay.prototype.initialize = function (details, _save_authorization_data) {
	paystack.transaction.initialize(
		details
	)
	.then(function(body) {
	  _save_authorization_data(body.data);
	  //body.data.authorization_url
	  //body.data.access_code
	  //body.data.reference
	})
	.catch(function(error) {
	  response.json(error, 404);
	});
};

module.exports = payaheadPay;