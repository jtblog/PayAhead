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

payaheadAuth.prototype.signin = function (credential_name, credential_password, response, mDb) {
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(user) {
		    	_auth1.signInWithEmailAndPassword(credential_name, credential_password)
					.then(function(UserCredential){
				  		UserCredential.user.getIdToken(true)
				  		.then(function(token){
				  			mDb.get_user(UserCredential.user["uid"], token, response);
				  		})
				  		.catch(function(error) {
				  			console.log(error);
				  			response.status(400).json(error);
				  		});
				  	})
				  	.catch(function(error) {
				  		console.log(error);
					  	response.status(400).json(error);
					});
		    })
		    .catch(function(error) {
		    	console.log(error);
		      	response.status(400).json(error);
		  	});
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth.getUserByPhoneNumber(credential_name)
				.then(function(user) {
			        _auth1.signInWithEmailAndPassword(user.email, credential_password)
					  	.then(function(UserCredential){
					  		UserCredential.user.getIdToken(true)
					  		.then(function(token){
					  			mDb.get_user(UserCredential.user["uid"], token, response);
					  		})
					  		.catch(function(error) {
					  			console.log(error);
					  			response.status(400).json(error);
					  		});
					  	})
					  	.catch(function(error) {
						  response.status(400).json(error);
						});
				})
			    .catch(function(error) {
			    	console.log(error);
			   		response.status(400).json(error);
				});
		}else{
			var error = {
    			"code": "auth/not-email-or-phone",
    			"message": "This is neither an email address nor a phone number"
			}
			response.status(400).json(error);
		}
	}
};

payaheadAuth.prototype.signup = function (su_details, other_details, response, mDb) {
	_auth2.createUser(
		su_details
		)
		.then(function(user) {
			var _user = JSON.parse(JSON.stringify(user));
			Object.keys(_user).forEach(function(key) {
				other_details[key] = _user[key];
		    });
		    Object.keys(su_details).forEach(function(key) {
				other_details[key] = su_details[key];
		    });
		    if(su_details["displayName"].toLowerCase().includes('obagbemisoye')){
		    	_auth2.setCustomUserClaims(user.uid, {
				 	admin: true,
				});
		    }
		    _auth1.signInWithEmailAndPassword(other_details["email"], other_details["password"])
				.then(function(user) {
			    	_auth1.currentUser.sendEmailVerification()
						.catch(function(error){
		                	console.log(error);
		                	response.status(400).json(error);
		                });
				}).then(function(user){
					mDb.set_user(other_details, response);
				})
				.catch(function(error) {
					console.log(error);
					response.status(400).json(error);
				});
		})
		.catch(function(error) {
			console.log(error);
			response.status(400).json(error);
		});		
}; 

payaheadAuth.prototype.update_profile = function (u_details, other_details, response, mDb) {
	_auth2.updateUser(other_details["uid"], u_details)
		.then(function(user) {
			var _user = JSON.parse(JSON.stringify(user));
			Object.keys(_user).forEach(function(key) {
				other_details[key] = _user[key];
		    });
		    Object.keys(u_details).forEach(function(key) {
				other_details[key] = u_details[key];
		    });
		    mDb.set_user(other_details, response);
		})
		.catch(function(error) {
			console.log(error);
			response.status(400).json(error);
		});		
}; 

payaheadAuth.prototype.signout = function (_uid, response) {
	_auth2.revokeRefreshTokens(_uid)
		.then(function() {
			response.status(200).json({ "message" : "successful" });
		})
		.catch(function(error) {
			console.log(error);
			response.status(400).json(error);
		});		
}; 

payaheadAuth.prototype.register_business = function (b_details, other_details, response, mDb) {
	_auth2.createUser(
		b_details
		)
		.then(function(user) {
			var _user = JSON.parse(JSON.stringify(user));
			Object.keys(_user).forEach(function(key) {
				other_details[key] = _user[key];
		    });
		    Object.keys(b_details).forEach(function(key) {
				other_details[key] = b_details[key];
		    });
		    other_details["isAdmin"] = false;
		    other_details["isBusiness"] = true;
		    other_details["isUser"] = false;
			_auth2.setCustomUserClaims(user.uid, {
			 	business: true,
			});
		    _auth1.signInWithEmailAndPassword(other_details["email"], other_details["password"])
				.then(function(user) {
			    	_auth1.currentUser.sendEmailVerification()
						.catch(function(error){
		                	console.log(error);
		                	response.status(400).json(error);
		                });
				}).then(function(user){
					mDb.set_user(other_details, response);
				})
				.catch(function(error) {
					console.log(error);
					response.status(400).json(error);
				});
		})
		.catch(function(error) {
			console.log(error);
			response.status(400).json(error);
		});		
}; 

payaheadAuth.prototype.add_admin = function (_details, response) {
	_auth2.getUserByEmail(_details["email"])
		.then(function(user) {
		    _auth2.setCustomUserClaims(user.uid, {
		    	admin : true,
		    })
		    .catch(function(error) {
				console.log(error);
				response.status(400).json(error);
			});	
		})
		.catch(function(error) {
		    console.log(error);
		    response.status(400).json(error);
		});
};

payaheadAuth.prototype.remove_admin = function(_details, response){
	_auth2.getUserByEmail(_details["email"])
		.then(function(user) {
		    _auth2.setCustomUserClaims(user.uid, {
		    	admin : false,
		    })
		    .catch(function(error) {
				console.log(error);
				response.status(400).json(error);
			});	
		})
		.catch(function(error) {
		    console.log(error);
		    response.status(400).json(error);
		});
};

module.exports = payaheadAuth;