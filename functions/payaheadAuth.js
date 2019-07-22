var validator = require('validator');
var _auth1, _auth2;
var _db;
var fs = require('fs');

function payaheadAuth() {
};

payaheadAuth.prototype.shareApp = function(iauth, iapp, idb) {
	_auth1 = iauth;
	_auth2 = iapp.auth();
	_db = idb;
};

payaheadAuth.prototype.signin = function (credential_name, credential_password, _respond, mDb) {
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(user) {
		    	_auth1.signInWithEmailAndPassword(credential_name, credential_password)
					.then(function(UserCredential){
				  		UserCredential.user.getIdToken(true)
				  		.then(function(token){
				  			mDb.get_user(UserCredential.user["uid"], token, _respond);
				  		})
				  		.catch(function(error) {
				  			console.log(error);
				  			_respond(error, 400);
				  		});
				  	})
				  	.catch(function(error) {
				  		console.log(error);
					  _respond(error, 400);
					});
		    })
		    .catch(function(error) {
		    	console.log(error);
		      	_respond(error, 400);
		  	});
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth.getUserByPhoneNumber(credential_name)
				.then(function(user) {
			        _auth1.signInWithEmailAndPassword(user.email, credential_password)
					  	.then(function(UserCredential){
					  		UserCredential.user.getIdToken(true)
					  		.then(function(token){
					  			mDb.get_user(UserCredential.user["uid"], token, _respond);
					  		})
					  		.catch(function(error) {
					  			console.log(error);
					  			_respond(error, 400);
					  		});
					  	})
					  	.catch(function(error) {
						  _respond(error, 400);
						});
				})
			    .catch(function(error) {
			    	console.log(error);
			    	_respond(error, 400);
				});
		}else{
			var err = {
    			"code": "auth/not-email-or-phone",
    			"message": "This is neither an email address nor a phone number"
			}
			_respond(err, 400);
		}
	}
};

payaheadAuth.prototype.signup = function (su_details, other_details, _respond, _post_request) {
	_auth2.createUser(
		su_details
		)
		.then(function(user) {
			Object.keys(user).forEach(function(key) {
				other_details[key] = user[key];
		    });
		    Object.keys(su_details).forEach(function(key) {
				other_details[key] = su_details[key];
		    });
		})
		.then(function(user){
			_auth1.signInWithEmailAndPassword(other_details["email"], other_details["password"])
				.then(function(user) {
			    	_auth1.currentUser.sendEmailVerification()
						.catch(function(error){
		                	console.log(error);
		                	_respond(error, 400);
		                });
				}).then(function(user){
					_post_request(other_details, "/writeNewUser");
				})
				.catch(function(error) {
					console.log(error);
					_respond(error, 400);
				});
		})
		.catch(function(error) {
			console.log(error);
			_respond(error, 400);
		});		
}; 

payaheadAuth.prototype.update_profile = function (u_details, other_details, _respond, _post_request) {
	_auth2.updateUser(other_details["uid"], u_details)
		.then(function(user) {
			Object.keys(user).forEach(function(key) {
				other_details[key] = user[key];
		    });
		    Object.keys(u_details).forEach(function(key) {
				other_details[key] = u_details[key];
		    });
		    _post_request(other_details, "/writeNewUser");
		})
		.catch(function(error) {
			console.log(error);
			_respond(error, 400);
		});		
}; 

payaheadAuth.prototype.signout = function (_uid, _respond) {
	_auth2.revokeRefreshTokens(_uid)
		.then(function() {
			_respond( { "message" : "successful" } , 200 );
		})
		.catch(function(error) {
			console.log(error);
			_respond(error, 400);
		});		
}; 

module.exports = payaheadAuth;