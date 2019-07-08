var validator = require('validator');
var _auth;

function payaheadAuth() {
}

payaheadAuth.prototype.shareApp = function(iapp) {
	_auth = iapp.auth();
};

payaheadAuth.prototype.signin = function (credential_name, credential_password, response) {
	if(validator.isEmail(credential_name)){
		_auth.getUserByEmail(credential_name)
		    .then(function(user) {
		    	return response.json(user);
		    })
		    .catch(function(error) {
		      	return response.json(error);
		  	});
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth.getUserByPhoneNumber(credential_name)
				.then(function(user) {
			        return response.json(user);
				})
			    .catch(function(error) {
			    	return response.json(error);
				});
		}else{
			var err = {
    			"code": "auth/not-email-or-phone",
    			"message": "This is neither an email address nor a phone number"
			}
			response.json(err);
		}
	}
};

payaheadAuth.prototype.signup = function (details, response) {
	_auth.createUser(
		details
		)
		.then(function(user) {
			return response.json(user)//.toJSON());
		})
		.catch(function(error) {
			return response.json(error);
		});
}; 

module.exports = payaheadAuth;