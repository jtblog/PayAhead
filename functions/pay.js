var secret_key = 'sk_test_694f6cdba683d71344d254e90077d7ecefad2368';
var paystack = require('paystack')(secret_key);

//const axios = require('axios');

function pay() {
}

pay.prototype.initialize = function (details, response) {
	paystack.transaction.initialize(
		details
	)
	.then(function(body) {
	  return response.json(body.data);
	  //body.data.access_code
	  //body.data.reference
	})
	.catch(function(error) {
	  return response.json(error);
	});
};

module.exports = pay;