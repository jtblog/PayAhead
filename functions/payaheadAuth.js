var validator = require('validator');
var _auth1, _auth2;

function payaheadAuth() {
}

payaheadAuth.prototype.shareApp = function(iauth, iapp) {
	_auth1 = iauth;
	_auth2 = iapp.auth();
};

payaheadAuth.prototype.signin = function (credential_name, credential_password, response) {
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(user) {
		    	//return response.json(user);
		    	_auth1.signInWithEmailAndPassword(credential_name, credential_password)
				  	.then(function(user) {
				  		response.json(user);
					})
				  	.catch(function(error) {
					  response.json(error);
					});
		    })
		    .catch(function(error) {
		      	return response.json(error);
		  	});
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth.getUserByPhoneNumber(credential_name)
				.then(function(user) {
			        //return response.json(user);
			        _auth1.signInWithEmailAndPassword(user.email, credential_password)
					  	.then(function(user) {
					  		response.json(user);
						})
					  	.catch(function(error) {
						  response.json(error);
						});
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

payaheadAuth.prototype.signup = function (su_details, other_details, mdb, response) {
	_auth2.createUser(
		su_details
		)
		.then(function(user) {
			Object.keys(user).forEach(function(key) {
				other_details[key] = user.key;
		    });
		    _auth1.signInWithEmailAndPassword(user["email"], user["password"])
				.then(function(user) {
					user.sendEmailVerification().then(
		                function() {
		                }, function(error) {
		                	response.json(error);
		                });
				})
				.catch(function(error) {
					response.json(error);
				});

		    //Save user to database
		    mdb.set_user(other_details, response);
		})
		.catch(function(error) {
			return response.json(error);
		});
}; 

function ts(_in) {
	return ""+_in;
}

module.exports = payaheadAuth;