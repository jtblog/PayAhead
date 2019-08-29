var validator = require('validator');
var _auth1, _auth2;
var _db;
var fs = require('fs');
var _request = require("request");

function payaheadAuth() {
	isNullOrUndefinedOrEmpty = function(_in){
	    switch(_in){
	      case null:
	        return true;
	        break;
	      case undefined:
	        return true;
	        break;
	      case "null":
	        return true;
	        break;
	      case "undefined":
	        return true;
	        break;
	      default:
	        return false;
	        break;
	    };

	    if(typeof _in == "string"){
	      if(_in.trim() == ""){
	        return true;
	      }
	    }else if(typeof _in == "undefined"){
	      return true;
	    };
	  };
};

payaheadAuth.prototype.confirm_password_reset = function (code, newPassword, email, response, mDb) {
	 _auth1.confirmPasswordReset(code, newPassword)
	 	.then(function(resp) {
	 		_auth2.getUserByEmail(email)
			    .then(function(user) {
			    	var _user = JSON.parse(JSON.stringify(user));
			    	_user["password"] = newPassword;
			    	mDb.set_user(_user ,response);
			    	mDb.write_activity( {"epoch": `${Date.now()}`, "uid": user.uid, "description": "Set/Reset password on PayAhead" }, response );
			    })
			    .catch(function(error) {
			    	console.log(error);
			      	response.status(400).json(error);
			  	});
	 		response.status(200).json({"code" : code});
		}).catch(function(error) {
			console.log(error);
		    response.status(400).json(error);
		});
};

payaheadAuth.prototype.get_user_claims = function (token, response) {
	var c = _auth2.verifyIdToken(token)
	.then(function(decodedToken) {
		response.status(200).json(decodedToken);
	  }).catch(function(error) {
	    
	  });
};

payaheadAuth.prototype.register_business = function (uid, b_details, other_details, response, mDb) {
	_auth2.createUser(
		b_details
		)
		.then(function(userRecord) {
			var _user = JSON.parse(JSON.stringify(userRecord));
			Object.keys(_user).forEach(function(key) {
				other_details[key] = _user[key];
		    });
		    Object.keys(b_details).forEach(function(key) {
				other_details[key] = b_details[key];
		    });
		    other_details["isBusiness"] = true;
			_auth2.setCustomUserClaims(_user["uid"], {
				"user": false,
				"business" : true,
				"admin" : false,
				"staff" : false
			});

			_auth1.sendPasswordResetEmail(other_details["email"]).then(function() {
				mDb.set_user(other_details, response);
				mDb.write_activity( {"epoch": `${Date.now()}`, "uid": uid, "description": "Registered" + other_details["business_name"] + "as a business entity on PayAhead" }, response);
			}).catch(function(error) {
				console.log(error);
		        response.status(400).json(error);
			});

		})
		.catch(function(error) {
			console.log(error);
			response.status(400).json(error);
		});		
}; 

payaheadAuth.prototype.resend_email_verification = function (credential_name, response, mDb) {
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(userRecord) {
		    	var _user = userRecord.toJSON();
		    	_db.ref("users/" + _user["uid"]).once("value", function(data) {
				      if (data) {
				      	var email = JSON.parse(JSON.stringify(data))["email"];
				      	var password = JSON.parse(JSON.stringify(data))["password"];
				      	_auth1.signInWithEmailAndPassword(email, password)
					          .then(function(UserCredential){
					          	UserCredential.user.sendEmailVerification()
					              .then(function(){
					                mDb.write_activity( {"epoch": `${Date.now()}`, "uid": UserCredential.user["uid"], "description": "Requested an email verification link to be sent" }, response);
					                response.status(200).json({});
					              })
					              .catch(function(error){
					                    console.log(error);
					                    response.status(400).json(error);
					              });
					            })
					            .catch(function(error) {
					              console.log(error);
					              response.status(400).json(error);
					          });
				      } else {
				        console.log(error);
				        response.status(400).json(error);
				      }
				  });
		    })
		    .catch(function(error) {
		    	console.log(error);
		      	response.status(400).json(error);
		  	});
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth2.getUserByPhoneNumber(credential_name)
				.then(function(userRecord) {
					var _user = userRecord.toJSON();
			        _db.ref("users/" + _user["uid"]).once("value", function(data) {
				      if (data) {
				      	var email = JSON.parse(JSON.stringify(data))["email"];
				      	var password = JSON.parse(JSON.stringify(data))["password"];
				      	_auth1.signInWithEmailAndPassword(email, password)
					          .then(function(UserCredential){
					            UserCredential.user.sendEmailVerification()
					              .then(function(){
					                mDb.write_activity( {"epoch": `${Date.now()}`, "uid": UserCredential.user["uid"], "description": "Requested an email verification link to be sent" }, response);
					                response.status(200).json({});
					              })
					              .catch(function(error){
					                console.log(error);
					                response.status(400).json(error);
					              });
					            })
					            .catch(function(error) {
					              console.log(error);
					              response.status(400).json(error);
					          });
				      } else {
				        console.log(error);
				        response.status(400).json(error);
				      }
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

/*payaheadAuth.prototype.resend_email_verification = function (credential_name, key, response, mDb) {
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(user) {
		    	var usr = user.toJSON();
		    	_db.ref("users/" + usr.uid).once("value", function(data) {
				      if (data) {
				      	var email = JSON.parse(JSON.stringify(data))["email"];
				      	var password = JSON.parse(JSON.stringify(data))["password"];
				      	_request.post({
								   url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+key,
								   form: '{"email":"' + email + '","password":"' + password + '","returnSecureToken":true}',
								   headers: { 'Content-Type' : 'application/json' },
								   method: 'POST'
							  	},
							  	function (error, _response, body) {
									if(error !== null){
										response.status(400).json(error);
									}else{
									  	_request.post({
												url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key='+key,
												form: '{"requestType":"VERIFY_EMAIL","idToken":"' + JSON.parse(body)["idToken"] + '"}',
												headers: { 'Content-Type' : 'application/json'},
												method: 'POST'
											},
											function (error, _response, body) {
												if(error !== null){
												  	response.status(400).json(error);
												}else{
												  	mDb.write_activity( {"epoch": `${Date.now()}`, "uid": usr["uid"], "description": "Requested an email verification link to be sent" }, response);
						                			response.status(200).json({});
												}
											});
									}
								});
				      } else {
				        console.log(error);
				        response.status(400).json(error);
				      }
				  });
		    })
		    .catch(function(error) {
		    	console.log(error);
		      	response.status(400).json(error);
		  	});
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth2.getUserByPhoneNumber(credential_name)
				.then(function(user) {
					var usr = user.toJSON();
			        _db.ref("users/" + usr.uid).once("value", function(data) {
				      if (data) {
				      	var email = JSON.parse(JSON.stringify(data))["email"];
				      	var password = JSON.parse(JSON.stringify(data))["password"];
				      	_auth1.signInWithEmailAndPassword(email, password)
					          .then(function(UserCredential){
					            _auth1.currentUser.sendEmailVerification()
					              .then(function(){
					                	mDb.write_activity( {"epoch": `${Date.now()}`, "uid": UserCredential.user["uid"], "description": "Requested an email verification link to be sent" }, response);
					                	response.status(200).json({});
					              })
					              .catch(function(error){
					                	console.log(error);
					                	response.status(400).json(error);
					              });
					           })
					           .catch(function(error) {
					            	console.log(error);
					              	response.status(400).json(error);
					          	});
				      } else {
				        console.log(error);
				        response.status(400).json(error);
				      }
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
};*/

payaheadAuth.prototype.reset_password = function (credential_name, response, mDb) {
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(userRecord) {
		    	var _user = userRecord.toJSON();
		    	var isBusiness = false;
		    	var isStaff = false;
		    	try{
		    		isBusiness = userRecord.customClaims["business"];
		    		isStaff = userRecord.customClaims["staff"];
		    	}catch(e){}

		    	_db.ref("users/" + _user["uid"]).once("value", function(data) {
				      if (data) {
				      	var email = JSON.parse(JSON.stringify(data))["email"];
				      	var password = JSON.parse(JSON.stringify(data))["password"];
				      	_auth1.signInWithEmailAndPassword(email, password)
							.then(function(UserCredential){
								if(isBusiness || isStaff){
							  		var error = {
										"code": "auth/password-reset-not-possible",
										"message": "You cannot reset your password. Contact PayAhead Administrators your company's representative with PayAhead to send a password reset link to your email"
									}
									response.status(400).json(error);
							  	}else{
							  		_auth1.sendPasswordResetEmail(_user["email"])
										.then(function() {
											mDb.write_activity( {"epoch": `${Date.now()}`, "uid": UserCredential.user["uid"], "description": "Requested a password reset on his/her PayAhead account" }, response);
											response.status(200).json({});
										})
										.catch(function(error) {
											console.log(error);
								        	response.status(400).json(error);
										});
							  	}
						  	})
						  	.catch(function(error) {
						  		console.log(error);
							  	response.status(400).json(error);
							});
				      } else {
				        console.log(error);
				        response.status(400).json(error);
				      }
				  });
		    })
		    .catch(function(error) {
		    	console.log(error);
		      	response.status(400).json(error);
		  	});
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth2.getUserByPhoneNumber(credential_name)
				.then(function(userRecord) {
					var _user = userRecord.toJSON();
			    	var isBusiness = false;
			    	var isStaff = false;
			    	try{
			    		isBusiness = userRecord.customClaims["business"];
			    		isStaff = userRecord.customClaims["staff"];
			    	}catch(e){}
			    	_db.ref("users/" + _user["uid"]).once("value", function(data) {
					      if (data) {
					      	var email = JSON.parse(JSON.stringify(data))["email"];
					      	var password = JSON.parse(JSON.stringify(data))["password"];
					      	_auth1.signInWithEmailAndPassword(email, password)
							  	.then(function(UserCredential){
							  		if(isBusiness || isStaff){
							  			var error = {
											"code": "auth/password-reset-not-possible",
											"message": "You cannot reset your password. Contact PayAhead Administrators your company's representative with PayAhead to send a password reset link to your email"
										}
										response.status(400).json(error);
							  		}else{
							  			_auth1.sendPasswordResetEmail(_user["email"])
											.then(function() {
												mDb.write_activity( {"epoch": `${Date.now()}`, "uid": UserCredential.user["uid"], "description": "Requested a password reset on his/her PayAhead account" }, response);
												response.status(200).json({});
											})
											.catch(function(error) {
												console.log(error);
								        		response.status(400).json(error);
											});
							  		}
							  	})
							  	.catch(function(error) {
								  response.status(400).json(error);
								});
					      } else {
					        console.log(error);
					        response.status(400).json(error);
					      }
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

payaheadAuth.prototype.shareApp = function(iauth, iapp, idb) {
	_auth1 = iauth;
	_auth2 = iapp.auth();
	_db = idb;
};

payaheadAuth.prototype.signin = function (credential_name, credential_password, response, request, mDb) {
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(userRecord) {
		    	var isBusiness = false;
		    	try{
		    		isBusiness = userRecord.customClaims["business"];
		    	}catch(e){}
		    	_auth1.signInWithEmailAndPassword(credential_name, credential_password)
					.then(function(UserCredential){
				  		if(!UserCredential.user["emailVerified"]){
					  		var error = {
							    "code": "auth/email-not-verified",
							    "message": "Email is not verified. Check and visit the link sent to your email"
							}
							response.status(400).json(error);
					  	}
					  	UserCredential.user.getIdToken(/* forceRefresh */ /*true*/)
				            .then(function(idToken) {
				              	mDb.get_user(UserCredential.user["uid"], JSON.parse(JSON.stringify(UserCredential.user)), idToken, response, request, mDb, isBusiness);
					  			mDb.write_activity( {"epoch": `${Date.now()}`, "uid": UserCredential.user["uid"], "description": "Signed in to PayAhead" }, response);
				            }).catch(function(error) {
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
			_auth2.getUserByPhoneNumber(credential_name)
				.then(function(userRecord) {
					var isBusiness = false;
			    	try{
			    		isBusiness = userRecord.customClaims["business"];
			    	}catch(e){}
			        _auth1.signInWithEmailAndPassword(userRecord.email, credential_password)
					  	.then(function(UserCredential){
					  		if(!UserCredential.user["emailVerified"]){
						  		var error = {
								    "code": "auth/email-not-verified",
								    "message": "Email is not verified. A verification link has been sent to your email"
								}
								response.status(400).json(error);
						  	}
						  	UserCredential.user.getIdToken(/* forceRefresh */ /*true*/)
					            .then(function(idToken) {
					              	mDb.get_user(UserCredential.user["uid"], JSON.parse(JSON.stringify(UserCredential.user)), idToken, response, request, mDb, isBusiness);
						  			mDb.write_activity( {"epoch": `${Date.now()}`, "uid": UserCredential.user["uid"], "description": "Signed in to PayAhead" }, response);
					            }).catch(function(error) {
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

payaheadAuth.prototype.signout = function (_uid, response, mDb) {
	mDb.write_activity( {"epoch": `${Date.now()}`, "uid": _uid, "description": "Signed out of PayAhead"}, response);
	_auth2.revokeRefreshTokens(_uid)
		.then(function() {
			response.status(200).json({ "message" : "successful" });
		})
		.catch(function(error) {
			console.log(error);
			response.status(400).json(error);
		});		
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

		    _auth2.setCustomUserClaims(_user["uid"], {
				"user": true,
				"business" : false,
				"admin" : false,
				"staff" : false
			});
			other_details["isUser"] = true;

		    var administrators = ['obagbemisoye', 'adewusijohnson'];
		    for(i=0; i<administrators.length; i++){
		    	if(su_details["displayName"].toLowerCase().trim().indexOf(administrators[i]) > -1){
			    	_auth2.setCustomUserClaims(_user["uid"], {
					 	"user": false,
					 	"business" : false,
					 	"admin": true,
					 	"staff": false
					});
					other_details["isAdmin"] = true;
					other_details["isUser"] = "";
			    }
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

payaheadAuth.prototype.update_profile = function (uid, u_details, other_details, response, mDb) {
	_auth2.updateUser(other_details["uid"], u_details)
		.then(function(userRecord) {
			var _user = JSON.parse(JSON.stringify(userRecord));
			Object.keys(_user).forEach(function(key) {
				other_details[key] = _user[key];
		    });
		    Object.keys(u_details).forEach(function(key) {
				other_details[key] = u_details[key];
		    });
		    mDb.write_activity( {"epoch": `${Date.now()}`, "uid": uid, "description": "Updated his/her profile on PayAhead" }, response );
		    mDb.set_user(other_details, response);
		})
		.catch(function(error) {
			console.log(error);
			response.status(400).json(error);
		});		
}; 

payaheadAuth.prototype.verify_email = function (code, response, mDb) {
	 _auth1.applyActionCode(code)
		 .then(function(resp) {
		 	response.status(200).json({"code" : code});
		  }).catch(function(error) {
		    console.log(error);
		    response.status(400).json(error);
		  });
};  

payaheadAuth.prototype.verify_passwordresetcode = function (code, response) {
	 _auth1.verifyPasswordResetCode(code)
		 .then(function(email) {
		    var accountEmail = email;
		    response.status(200).json({"email" : accountEmail});
		  }).catch(function(error) {
		    console.log(error);
		    response.status(400).json(error);
		  });
}; 

/*payaheadAuth.prototype.add_admin = function (credential_name, mDb, response) {
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(user) {
		    	var _user = JSON.parse(JSON.stringify(user));
		    	var other_details = {};
				Object.keys(_user).forEach(function(key) {
					other_details[key] = _user[key];
			    });
			    other_details["isAdmin"] = true;
			    mDb.set_user(other_details, response);
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
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth2.getUserByPhoneNumber(credential_name)
				.then(function(user) {
					var _user = JSON.parse(JSON.stringify(user));
			    	var other_details = {};
					Object.keys(_user).forEach(function(key) {
						other_details[key] = _user[key];
				    });
				    other_details["isAdmin"] = true;
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
		}else{
			var error = {
    			"code": "auth/not-email-or-phone",
    			"message": "This is neither an email address nor a phone number"
			}
			response.status(400).json(error);
		}
	}
};

payaheadAuth.prototype.remove_admin = function(credential_name, mDb, response){
	if(validator.isEmail(credential_name)){
		_auth2.getUserByEmail(credential_name)
		    .then(function(user) {
		    	var _user = JSON.parse(JSON.stringify(user));
		    	var other_details = {};
				Object.keys(_user).forEach(function(key) {
					other_details[key] = _user[key];
			    });
			    other_details["isAdmin"] = false;
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
	}else{
		if(validator.isMobilePhone(credential_name)){
			_auth2.getUserByPhoneNumber(credential_name)
				.then(function(user) {
					var _user = JSON.parse(JSON.stringify(user));
			    	var other_details = {};
					Object.keys(_user).forEach(function(key) {
						other_details[key] = _user[key];
				    });
				    other_details["isAdmin"] = false;
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
		}else{
			var error = {
    			"code": "auth/not-email-or-phone",
    			"message": "This is neither an email address nor a phone number"
			}
			response.status(400).json(error);
		}
	}
};*/



module.exports = payaheadAuth;