var secret_key = 'sk_test_694f6cdba683d71344d254e90077d7ecefad2368';
var paystack = require('paystack')(secret_key);

//const axios = require('axios');

function payaheadPay() {
}

//payaheadPay.prototype.initialize = function (details, _save_authorization_data) {
payaheadPay.prototype.initialize = function (details, response, mDb) {
	paystack.transaction.initialize(
		details
	)
	.then(function(body) {
		response.status(200).json(body.data);
		mDb.set_authorization("last_of_paystack", body.data, response);
	})
	.catch(function(error) {
	  response.status(400).json(error);
	});
};

module.exports = payaheadPay;