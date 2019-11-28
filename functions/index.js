functions = require('firebase-functions');
admin = require('firebase-admin');
firebase = require('firebase');
randStr = require('randomstring');
jsonQuery = require('json-query');
Fuse = require('fuse.js');
WebSocket = require('ws');
//const swPrecache = require('sw-precache')

parser = require('body-parser');
json_parser = parser.json( { type: "application/*+json" } );
//urlencoded_parser = parser.urlencoded( { extended : false } );
//raw_parser = parser.raw( { type : 'application/vnd.custom-type' } );
//text_parser = parser.text( { type : 'text/html' } );

express = require('express');

serviceAccount  = require('./payahead-firebase-adminsdk-credentials.json');
config  = require('./payahead-firebase-javascriptsdk-credentials.json');
rave_keys = require('./rave_pay_keys.json');
mAuth = require('./payaheadAuth');
mDb = require('./payaheadDb');
mPay = require('./payaheadPay');

app = express();
cors = require('cors');
app.use(cors());

//swPrecache.write('./public/service-worker.js', {
//    root: './public/',
//    staticFileGlobs: ['./public/**/*'],
//    stripPrefix: './public/'
//})

firebase.initializeApp(config);

// Initialize the default app
defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://payahead-80360.firebaseio.com"
});

mAuth = new mAuth();
mDb = new mDb();
mPay = new mPay();

payahead_auth = firebase.auth();
//payahead_db = firebase.database();
_auth = defaultApp.auth();
_db = defaultApp.database();
mAuth.shareApp(payahead_auth, defaultApp, _db);
//mDb.shareApp(payahead_db);
mDb.shareApp(_db);

defaultPhotoURL = "https://firebasestorage.googleapis.com/v0/b/payahead-80360.appspot.com/o/index.png?alt=media&token=473d280c-967d-4253-8bfb-b6f033347371";

isNullOrUndefinedOrEmpty = function(_in){
  var _check = _in+"";
  switch(_check){
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
    case "{}":
      return true;
      break;
    case {}:
      return true;
      break;
    case "[]":
      return true;
      break;
    case []:
      return true;
      break;
    default:
      if(typeof _check == "string"){
	    if(_check.trim() == "" || _check.split(" ").join("") == ""){
	      return true;
	    }else{
	    	return false;
	    }
	  }else if(typeof _check == "undefined"){
	    return true;
	  }
      break;
  };
};

function verifyToken(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken){
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
			request.admin = decodedToken["admin"];
			request.business = decodedToken["business"];
			request.user = decodedToken["user"];
			request.staff = decodedToken["staff"];
			return next();
		}else{
			response.status(401).send({"code": "auth/not-logged-in", "message" : "This Priviledge is only granted to PayAhead's logged in users"});
		}
	  }).catch(function(error) {
	    response.status(401).send(error);
	  });
};

function isAdmin(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken["admin"]){
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
			request.admin = decodedToken["admin"];
			request.business = decodedToken["business"];
			request.user = decodedToken["user"];
			request.staff = decodedToken["staff"];
			return next();
		}else{
			response.status(401).send({"code": "auth/not-an-admin", "message" : "This Priviledge is only granted to PayAhead's admin users"});
		}
	  }).catch(function(error) {
	    response.status(401).send(error);
	  });
};

function isBusiness(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken["business"]){
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
			request.admin = decodedToken["admin"];
			request.business = decodedToken["business"];
			request.user = decodedToken["user"];
			request.staff = decodedToken["staff"];
			return next();
		}else{
			response.status(401).send({"code": "auth/not-a-business", "message" : "This Priviledge is only granted to PayAhead's registered business owner(s)/vendor"});
		}
	  }).catch(function(error) {
	    response.status(401).send(error);
	  });
};

function isStaff(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken["staff"]){
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
			request.admin = decodedToken["admin"];
			request.business = decodedToken["business"];
			request.user = decodedToken["user"];
			request.staff = decodedToken["staff"];
			return next();
		}else{
			response.status(401).send({"code": "auth/not-a-staff", "message" : "This Priviledge is only granted to staffs of businesses registered on PayAhead's"});
		}
	  }).catch(function(error) {
	    response.status(401).send(error);
	  });
};

function isBusinessOrStaff(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken["business"] || decodedToken["staff"]){
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
			request.admin = decodedToken["admin"];
			request.business = decodedToken["business"];
			request.user = decodedToken["user"];
			request.staff = decodedToken["staff"];
			return next();
		}else{
			response.status(401).send({"code": "auth/not-a-BusinessOrStaff", "message" : "This Priviledge is only granted to PayAhead's registered business owner(s)/vendor or staffs of businesses registered on PayAhead"});
		}
	  }).catch(function(error) {
	    response.status(401).send(error);
	  });
};

function isAdminOrBusiness(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken["admin"] || decodedToken["business"]){
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
			request.admin = decodedToken["admin"];
			request.business = decodedToken["business"];
			request.user = decodedToken["user"];
			request.staff = decodedToken["staff"];
			return next();
		}else{
			response.status(401).send({"code": "auth/not-an-AdminOrBusiness", "message" : "This Priviledge is only granted to PayAhead's admin users or PayAhead's registered business owner(s)/vendor"});
		}
	  }).catch(function(error) {
	    response.status(401).send(error);
	  });
};

function isAdminOrBusinessOrStaff(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken["admin"] || decodedToken["business"] || decodedToken["staff"]){
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
			request.admin = decodedToken["admin"];
			request.business = decodedToken["business"];
			request.user = decodedToken["user"];
			request.staff = decodedToken["staff"];
			return next();
		}else{
			response.status(401).send({"code": "auth/not-an-AdminOrBusinessOrStaff", "message" : "This Priviledge is only granted to PayAhead's admin users or PayAhead's registered business owner(s)/vendor as well as their staffs"});
		}
	  }).catch(function(error) {
	    response.status(401).send(error);
	  });
};

function isNotBusinessOrStaff(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken["business"]){
			response.status(401).send({"code": "auth/not-allowed", "message" : "This Priviledge is not granted to you. Contact PayAhead's customer care / administrators"});
		}else if(decodedToken["staff"]){
			response.status(401).send({"code": "auth/not-allowed", "message" : "This Priviledge is not granted to you. Contact PayAhead's customer care / administrators"});
		}else{
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
			request.admin = decodedToken["admin"];
			request.business = decodedToken["business"];
			request.user = decodedToken["user"];
			request.staff = decodedToken["staff"];
			return next();
		}
	  }).catch(function(error) {
	    response.status(401).send(error);
	  });
};

app.get('/', json_parser, function(request, response){
	var url = request.protocol + "://" + request.headers['x-forwarded-host'];
  	response.redirect(url + '/index.html');
});

app.get('/signin', json_parser, function(request, response){
  	var url = request.protocol + "://" + request.headers['x-forwarded-host'];
  	response.redirect(url + '/signin.html');
});

app.get('/signup', json_parser, function(request, response){
  	var url = request.protocol + "://" + request.headers['x-forwarded-host'];
  	response.redirect(url + '/signup.html');
});

app.get('/user', json_parser, function(request, response){
  	var url = request.protocol + "://" + request.headers['x-forwarded-host'];
  	response.redirect(url + '/user.html');
});

app.post('/auth/signin', json_parser, function(request, response){
	var _details = request.body;
	var credential_name = _details["emailOrPhoneNumber"];
	var credential_password = _details["password"];

	if(isNullOrUndefinedOrEmpty(credential_name)){
		var error = { "code": "auth/not-email-or-phone", "message": "This is neither an email address nor a phone number" }
		response.status(400).json(error);
		response.end();
	}else{
		mAuth.signin(credential_name, credential_password, response, request, mDb);
	}
});

app.post('/auth/resend_email_verification', json_parser, function(request, response){
	var _details = request.body;
	var credential_name = _details["emailOrPhoneNumber"];
	//var credential_password = _details["password"];

	if(isNullOrUndefinedOrEmpty(credential_name)){
		var error = { "code": "auth/not-email-or-phone", "message": "This is neither an email address nor a phone number" }
		response.status(400).json(error);
		response.end();
	}else{
		mAuth.resend_email_verification(credential_name, response, mDb);
		//mAuth.resend_email_verification(credential_name, config["apiKey"], response, mDb);
	}
});

app.post('/auth/reset_password', json_parser, function(request, response){
	var _details = request.body;
	var credential_name = _details["emailOrPhoneNumber"];
	//var credential_password = _details["password"];

	if(isNullOrUndefinedOrEmpty(credential_name)){
		var error = { "code": "auth/not-email-or-phone", "message": "This is neither an email address nor a phone number" }
		response.status(400).json(error);
		response.end();
	}else{
		mAuth.reset_password(credential_name, response, mDb);
	}
});

app.post('/auth/signup', json_parser, function(request, response){
	var _details = request.body
	var su_details = {};
	su_details["emailVerified"] = false;
	su_details["disabled"] = false;
	su_details["displayName"] = _details["displayName"];
	su_details["email"] = _details["email"];
	su_details["password"] = _details["password"];
	su_details["phoneNumber"] = _details["phoneNumber"];
	su_details["photoURL"] = defaultPhotoURL;

	var other_details = {};
	if(isNullOrUndefinedOrEmpty(_details["industry"])){
		response.status(400).json( { "code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}else{
		other_details["industry"] = _details["industry"];
	}

	mAuth.signup(su_details, other_details, response, mDb);
});

app.get('/ping', verifyToken, function(request, response){
	response.status(200).send('pong');
});

app.post('/payment/initialize', verifyToken, json_parser, function(request, response){
	var p_details = request.body;
	mPay.initialize(p_details, response, mDb);
});

app.get('/db/industries', function(request, response){
	mDb.get_industry(response);
});

app.get('/get_profile/:uid', verifyToken, function(request, response){
	//var _in = request.body;
	var params = request.params;
	if(isNullOrUndefinedOrEmpty(params["uid"])){
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}else{
		mDb.get_user(params["uid"], null, request.headers.authorization, response, request, mDb, _auth.verifyIdToken(request.headers.authorization)["business"]);
	}
});

/*app.get('/get_user_claims/:uid', verifyToken, function(request, response){
	//var _in = request.body;
	var params = request.params;
	if(isNullOrUndefinedOrEmpty(params["uid"])){
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}else{
		mAuth.get_user_claims(request.headers.authorization, response);
	}
});*/

app.post('/auth/updateOrCreateUser', isAdminOrBusiness, json_parser, function(request, response){
	var _details = request.body;
	var pass_key = randStr.generate(8);
	var new_data = request.body["newdata"];
	new_data["password"] = pass_key;

	if(!isNullOrUndefinedOrEmpty(new_data)){
		Object.keys(new_data).forEach(function(key) {
			_details[key] = new_data[key];
		});
		_details["newdata"] = null;

	_auth.getUserByEmail(_details['email'])
	    .then(function(userRecord) {
	    	//Update user
	    	if(request.email == _details["email"]){
				response.status(400).json({ "code" : "auth/failed-to-createOrUpdate",
					"message" : "You cannot perform an account creation or update through this means"
				});
				response.end();
			}

			var u_details = {};
			u_details["emailVerified"] = _details["emailVerified"];
			u_details["disabled"] = _details["disabled"];
			u_details["displayName"] = _details["displayName"];
			u_details["email"] = _details["email"];
			u_details["password"] = pass_key;
			u_details["phoneNumber"] = _details["phoneNumber"];
			if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
				u_details["photoURL"] = _details["photoURL"];
			}else{
				u_details["photoURL"] = defaultPhotoURL;
			}
			
			var other_details = {};
			Object.keys(_details).forEach(function(key) {
				if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
				other_details[key] = _details[key];
			});

			other_details["uid"] = _details["uid"];

			if(!isNullOrUndefinedOrEmpty(_details["industry"])){
				other_details["industry"] = _details["industry"];
			}else{
				response.status(400).json({ "code" : "auth/industry",
					"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
				});
				response.end();
			}
			mAuth.updateUser(u_details, other_details, response, request, mDb);
	    })
	    .catch(function(error) {
	    	
	    	_auth.getUserByPhoneNumber(_details['phoneNumber'])
			    .then(function(userRecord) {
			    	//Update user
			    	if(request.email == _details["email"]){
						response.status(400).json({ "code" : "auth/failed-to-createOrUpdate",
							"message" : "You cannot perform an account creation or update through this means"
						});
						response.end();
					}

					var u_details = {};
					u_details["emailVerified"] = _details["emailVerified"];
					u_details["disabled"] = _details["disabled"];
					u_details["displayName"] = _details["displayName"];
					u_details["email"] = _details["email"];
					u_details["password"] = pass_key;
					u_details["phoneNumber"] = _details["phoneNumber"];
					if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
						u_details["photoURL"] = _details["photoURL"];
					}else{
						u_details["photoURL"] = defaultPhotoURL;
					}
					
					
					var other_details = {};
					Object.keys(_details).forEach(function(key) {
						if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
						other_details[key] = _details[key];
					});

					other_details["uid"] = _details["uid"];

					if(!isNullOrUndefinedOrEmpty(_details["industry"])){
						other_details["industry"] = _details["industry"];
					}else{
						response.status(400).json({ "code" : "auth/industry",
							"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
						});
						response.end();
					}
					mAuth.updateUser(u_details, other_details, response, request, mDb);

			    })
			    .catch(function(error) {
			    	//Create new user
					if(!_details["email"].endsWith(request.email.split('@')[1])){
						if(request.business || request.staff){
							//Can only create user with the same organization email
							response.status(400).json({ "code" : "auth/invalid-email-host",
								"message" : "Can only create/update user from the same organization"
							});
							response.end();
						}
					}

					var u_details = {};
					u_details["emailVerified"] = _details["emailVerified"];
					u_details["disabled"] = _details["disabled"];
					u_details["displayName"] = _details["displayName"];
					u_details["email"] = _details["email"];
					u_details["password"] = pass_key;
					u_details["phoneNumber"] = _details["phoneNumber"];
					if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
						u_details["photoURL"] = _details["photoURL"];
					}else{
						u_details["photoURL"] = defaultPhotoURL;
					}
					
					
					var other_details = {};
					Object.keys(_details).forEach(function(key) {
						if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
						other_details[key] = _details[key];
					});

					other_details["uid"] = _details["uid"];

					if(!isNullOrUndefinedOrEmpty(_details["industry"])){
						other_details["industry"] = _details["industry"];
					}else{
						response.status(400).json({ "code" : "auth/industry",
							"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
						});
						response.end();
					}
					mAuth.createUser(u_details, other_details, response, request, mDb);
			  	});

	  	});
	}else{
		response.status(400).json(
			{ "code" : "auth/no-new-data",
			  "message" : "No new information found"
			}
		);
		response.end();
	}	
});

app.post('/auth/update_profile', isNotBusinessOrStaff, json_parser, function(request, response){
	var _details = request.body;
	var pass_key = randStr.generate(8);
	var new_data = request.body["newdata"];
	Object.keys(new_data).forEach(function(key) {
		if(!isNullOrUndefinedOrEmpty(new_data[key])){
			_details[key] = new_data[key];
		}
	});
	_details["newdata"] = null;

	var u_details = {};
	u_details["emailVerified"] = _details["emailVerified"];
	u_details["disabled"] = _details["disabled"];
	u_details["displayName"] = _details["displayName"];
	u_details["email"] = _details["email"];
	u_details["password"] = pass_key;
	u_details["phoneNumber"] = _details["phoneNumber"];
	if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
		u_details["photoURL"] = _details["photoURL"];
	}else{
		u_details["photoURL"] = defaultPhotoURL;
	}
	
	var other_details = {};
	Object.keys(_details).forEach(function(key) {
		if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
		other_details[key] = _details[key];
	});

	other_details["uid"] = _details["uid"];

	if(!isNullOrUndefinedOrEmpty(_details["industry"])){
		other_details["industry"] = _details["industry"];
	}else{
		response.status(400).json({ "code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}

	if(!other_details["isAdmin"]){
		mAuth.updateUser(u_details, other_details, response, request, mDb);
	}else{
		response.status(400).json({ "code" : "auth/not-authorized",
			"message" : "You cannot disable an administrators"
		});
		response.end();
	}
});

app.post('/auth/disableUser', isAdminOrBusiness, json_parser, function(request, response){
	var _details = request.body;
	var new_data = request.body["newdata"];
	Object.keys(new_data).forEach(function(key) {
		_details[key] = new_data[key];
	});
	_details["newdata"] = null;

	var u_details = {};
	u_details["emailVerified"] = _details["emailVerified"];
	u_details["disabled"] = _details["disabled"];
	u_details["displayName"] = _details["displayName"];
	u_details["email"] = _details["email"];
	u_details["password"] = pass_key;
	u_details["phoneNumber"] = _details["phoneNumber"];

	if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
		u_details["photoURL"] = _details["photoURL"];
	}else{
		u_details["photoURL"] = defaultPhotoURL;
	}
	
	
	var other_details = {};
	Object.keys(_details).forEach(function(key) {
		if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
		other_details[key] = _details[key];
	});

	other_details["uid"] = _details["uid"];

	if(!isNullOrUndefinedOrEmpty(_details["industry"])){
		other_details["industry"] = _details["industry"];
	}else{
		response.status(400).json({ "code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}

	mAuth.disableUser(u_details, other_details, response, request, mDb);
});

app.post('/signout/:uid', function(request, response){
	//var _in = request.body;
	var params = request.params;
	if(isNullOrUndefinedOrEmpty(params["uid"])){
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}else{
		mAuth.signout(params["uid"], response, mDb);
	}
});

app.get('/payment/get_paystack_keys', verifyToken, function(request, response){
	mDb.get_paystack_keys(response);
});

app.get('/payment/get_rave_keys', verifyToken, function(request, response){
	var keys = { 'PBFPubKey': rave_keys['publicKey'], 'PBFSecKey': rave_keys['secretKey']  };
	response.status(200).json(keys);
});

app.get('/db/get_organizations', verifyToken, function(request, response){
	mDb.get_organizations(response);
});

app.get('/payment/get_transactions/:uid', verifyToken, function(request, response){
	var params = request.params;
	if(isNullOrUndefinedOrEmpty(params["uid"])){
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}else{
		mDb.get_transactions(params["uid"], response);
	}
});

app.post('/payment/save_transaction', verifyToken, json_parser, function(request, response){
	var _details = request.body;
	_details["paymentId"] = '' + Math.floor((Math.random() * 1000000000) + 1);
	mDb.save_transaction(request.uid, _details, response, mDb);
});

app.post('/chat/save_conversation', verifyToken, json_parser, function(request, response){
	var _details = request.body;
	_details["conversationId"] = '' + Math.floor((Math.random() * 1000000000) + 1);
	mDb.save_conversation(request.uid, _details, response, mDb);
});

app.post('/report_error', json_parser, function(request, response){
	var _in = request.body;
	_in["epoch"] = `${Date.now()}`;
	mDb.save_error(_in, response);
});

app.get('/get_users', verifyToken, function(request, response){
	mDb.get_users(response);
});

app.post('/verify_actioncode', json_parser, function(request, response){
	var _in = request.body;
	var actionCode = _in["actionCode"];
	var mode = _in["mode"];
	if(!isNullOrUndefinedOrEmpty(mode)){
		switch(mode){
	        case 'resetPassword':
	        	mAuth.verify_passwordresetcode(actionCode, response);
	          break;
	        case 'recoverEmail':
	          break;
	        case 'verifyEmail':
	        	mAuth.verify_email(actionCode, response, mDb);
	          break;
	        default:
	          // Error: invalid mode.
	      }
	  }else{
	  	response.status(400).json({
			"code" : "auth/no-mode",
			"message" : "No action attached"
		});
		response.end();
	  }
});

app.post('/confirm_password_reset', json_parser, function(request, response){
	var _in = request.body;
	var actionCode = _in["actionCode"];
	var password = _in["newPassword"];
	var email = _in["email"];
	if(!isNullOrUndefinedOrEmpty(email)){
		mAuth.confirm_password_reset(actionCode, password, email, response, mDb);
	}else{
		response.status(400).json({
			"code" : "auth/invalid-email",
			"message" : "Email cannot be null, empty or undefined"
		});
		response.end();
	}
});

app.post('/save_business_account', verifyToken, json_parser, function(request, response){
	var _in = request.body;
	var uid = request.uid;
	mDb.save_businessuser_details(uid, _in, response, mDb);
});

app.post('/db/fsquery', json_parser, function(request, response){
	var _details = request.body;
	var jsonObj = _details["jsonObject"];
	var query = _details["query"];
	var startDate = _details["startDate"];
	var endDate = _details["endDate"];

	if(!isNullOrUndefinedOrEmpty(startDate) && !isNullOrUndefinedOrEmpty(endDate)){
		if(!isNullOrUndefinedOrEmpty(query)){
			//startDate, endDate and Fuzzy
			if(startDate < endDate){
				var _filtrate = [];
				//var _residue = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] >= startDate && jsonObj[key]["createdAt"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}/*else{
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_residue.push(jsonObj[key]);
						}*/
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] >= startDate && jsonObj[key]["epoch"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] >= startDate && jsonObj[key]["epochPayed"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });
				var showIds = [];
				var hideIds = [];
				var keys = [];
				if(_filtrate.length > 0){
					Object.keys(_filtrate[0]).forEach(function(key) {
						keys.push(key);
				    });
					var options = {
					  shouldSort: true,
					  threshold: 0.6,
					  location: 0,
					  distance: 100,
					  maxPatternLength: 32,
					  minMatchCharLength: 1,
					  keys: keys
					};
					var fuse = new Fuse(_filtrate, options);
					var result = fuse.search(query);

					var i;
					for (i = 0; i < result.length; i++) {
					  showIds.push(result[i]["key"]);
					  all_keys.pop(result[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}else{
				var _filtrate = [];
				//var _residue = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] <= startDate && jsonObj[key]["createdAt"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] <= startDate && jsonObj[key]["epoch"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] <= startDate && jsonObj[key]["epochPayed"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

			    var showIds = [];
				var hideIds = [];
				var keys = [];
				if(_filtrate.length > 0){
					Object.keys(_filtrate[0]).forEach(function(key) {
						keys.push(key);
				    });
					var options = {
					  shouldSort: true,
					  threshold: 0.6,
					  location: 0,
					  distance: 100,
					  maxPatternLength: 32,
					  minMatchCharLength: 1,
					  keys: keys
					};
					var fuse = new Fuse(_filtrate, options);
					var result = fuse.search(query);

					var i;
					for (i = 0; i < result.length; i++) {
					  showIds.push(result[i]["key"]);
					  all_keys.pop(result[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}
		}else{
			//startDate and endDate only
			if(startDate < endDate){
				var _filtrate = [];
				//var _residue = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] >= startDate && jsonObj[key]["createdAt"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] >= startDate && jsonObj[key]["epoch"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] >= startDate && jsonObj[key]["epochPayed"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });
			    var showIds = [];
			    var hideIds = [];
				if(_filtrate.length > 0){
					var i;
					for (i = 0; i < _filtrate.length; i++) {
					  	showIds.push(_filtrate[i]["key"]);
					  	all_keys.pop(_filtrate[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}else{
				var _filtrate = [];
				//var _residue = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] <= startDate && jsonObj[key]["createdAt"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] <= startDate && jsonObj[key]["epoch"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] <= startDate && jsonObj[key]["epochPayed"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });
			    var showIds = [];
			    var hideIds = [];
				if(_filtrate.length > 0){
					var i;
					for (i = 0; i < _filtrate.length; i++) {
					  	showIds.push(_filtrate[i]["key"]);
					  	all_keys.pop(_filtrate[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}
		}
	}else{
		if(!isNullOrUndefinedOrEmpty(startDate)){
			if(!isNullOrUndefinedOrEmpty(query)){
				//startDate and Fuzzy
				var _filtrate = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

				var showIds = [];
				var hideIds = [];
				var keys = [];
				if(_filtrate.length > 0){
					Object.keys(_filtrate[0]).forEach(function(key) {
						keys.push(key);
				    });
					var options = {
					  shouldSort: true,
					  threshold: 0.6,
					  location: 0,
					  distance: 100,
					  maxPatternLength: 32,
					  minMatchCharLength: 1,
					  keys: keys
					};
					var fuse = new Fuse(_filtrate, options);
					var result = fuse.search(query);

					var i;
					for (i = 0; i < result.length; i++) {
					  showIds.push(result[i]["key"]);
					  all_keys.pop(result[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}else{
				//startDate only
				var _filtrate = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

				var showIds = [];
			    var hideIds = [];
				if(_filtrate.length > 0){
					var i;
					for (i = 0; i < _filtrate.length; i++) {
					  	showIds.push(_filtrate[i]["key"]);
					  	all_keys.pop(_filtrate[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}
		}

		if(!isNullOrUndefinedOrEmpty(endDate)){
			if(!isNullOrUndefinedOrEmpty(query)){
				//endDate and Fuzzy
				var _filtrate = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

				var showIds = [];
				var hideIds = [];
				var keys = [];
				if(_filtrate.length > 0){
					Object.keys(_filtrate[0]).forEach(function(key) {
						keys.push(key);
				    });
					var options = {
					  shouldSort: true,
					  threshold: 0.6,
					  location: 0,
					  distance: 100,
					  maxPatternLength: 32,
					  minMatchCharLength: 1,
					  keys: keys
					};
					var fuse = new Fuse(_filtrate, options);
					var result = fuse.search(query);

					var i;
					for (i = 0; i < result.length; i++) {
					  showIds.push(result[i]["key"]);
					  all_keys.pop(result[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}else{
				//endDate only
				var _filtrate = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

				var showIds = [];
			    var hideIds = [];
				if(_filtrate.length > 0){
					var i;
					for (i = 0; i < _filtrate.length; i++) {
					  	showIds.push(_filtrate[i]["key"]);
					  	all_keys.pop(_filtrate[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}
		}

		if(isNullOrUndefinedOrEmpty(startDate) && isNullOrUndefinedOrEmpty(endDate) && !isNullOrUndefinedOrEmpty(query)){
			//Fuzzy only
			var _filtrate = [];
			var all_keys = [];
			Object.keys(jsonObj).forEach(function(key) {
				all_keys.push(key);
				if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
					jsonObj[key]["key"] = jsonObj[key]["createdAt"];
					_filtrate.push(jsonObj[key]);
				}
				if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
					jsonObj[key]["key"] = jsonObj[key]["epoch"];
					_filtrate.push(jsonObj[key]);
				}
				if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
					jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
					_filtrate.push(jsonObj[key]);
				}
		    });

			var showIds = [];
			var hideIds = [];
			var keys = [];
			if(_filtrate.length > 0){
				Object.keys(_filtrate[0]).forEach(function(key) {
					keys.push(key);
			    });
				var options = {
				  shouldSort: true,
				  threshold: 0.6,
				  location: 0,
				  distance: 100,
				  maxPatternLength: 32,
				  minMatchCharLength: 1,
				  keys: keys
				};
				var fuse = new Fuse(_filtrate, options);
				var result = fuse.search(query);

				var i;
				for (i = 0; i < result.length; i++) {
				  showIds.push(result[i]["key"]);
				}
				var i;
				for (i = 0; i < all_keys.length; i++) {
				  if(showIds.indexOf(all_keys[i]["key"]) <= -1){
				  	hideIds.push(all_keys[i]["key"]);
				  }
				}
				response.status(200).json({"showIds" : showIds, "hideIds" : hideIds});
			}else{
				response.status(200).json({"showIds" : [], "hideIds" : all_keys});
			}
			
		}
	}
});

app.get('/get_credentials', verifyToken, function(request, response){
	response.status(200).json({ "preset" : config, "refEndpoint" : "users/"+request.uid });
});

app.post('/notification', json_parser, function(request, response){
	var _details = request.body;
	/*var registrationToken = 'YOUR_REGISTRATION_TOKEN';
	var message = {
		notification: {
			title: '$GOOG up 1.43% on the day',
			body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
		},
		token: registrationToken
	};*/
	
	// Send a message to devices subscribed to the combination of topics
	// specified by the provided condition.
	admin.messaging().send(_details)
		.then((response) => {
			// Response is a message ID string.
			console.log('Successfully sent message:', response);
		})
		.catch((error) => {
			response.status(400).json(error);
		});
});














































/*
app.get('/admin/db/get_tranactions', verifyToken, isAdmin, json_parser, function(request, response){
	//mDb.admin_get_tranactions();
});*/

app.get('/admin', json_parser, function(request, response){
  	var url = request.protocol + "://" + request.headers['x-forwarded-host'];
  	response.redirect(url + '/admin/index.html');
});

app.get('/admin/company/get_users', isBusinessOrStaff, function(request, response){
  	mDb.get_company_users(request.email, response);
});

app.get('/admin/get_users', isAdmin, function(request, response){
	mDb.get_users(response);
});

app.post('/admin/auth/signin', json_parser, function(request, response){
	var _details = request.body;
	var credential_name = _details["emailOrPhoneNumber"];
	var credential_password = _details["password"];

	if(isNullOrUndefinedOrEmpty(credential_name)){
		var error = { "code": "auth/not-email-or-phone", "message": "This is neither an email address nor a phone number" }
		response.status(400).json(error);
		response.end();
	}else{
		mAuth.signin(credential_name, credential_password, response, request, mDb);
	}
});

app.post('/admin/db/fsquery', json_parser, function(request, response){
	var _details = request.body;
	var jsonObj = _details["jsonObject"];
	var query = _details["query"];
	var startDate = _details["startDate"];
	var endDate = _details["endDate"];

	if(!isNullOrUndefinedOrEmpty(startDate) && !isNullOrUndefinedOrEmpty(endDate)){
		if(!isNullOrUndefinedOrEmpty(query)){
			//startDate, endDate and Fuzzy
			if(startDate < endDate){
				var _filtrate = [];
				//var _residue = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] >= startDate && jsonObj[key]["createdAt"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}/*else{
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_residue.push(jsonObj[key]);
						}*/
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] >= startDate && jsonObj[key]["epoch"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] >= startDate && jsonObj[key]["epochPayed"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });
				var showIds = [];
				var hideIds = [];
				var keys = [];
				if(_filtrate.length > 0){
					Object.keys(_filtrate[0]).forEach(function(key) {
						keys.push(key);
				    });
					var options = {
					  shouldSort: true,
					  threshold: 0.6,
					  location: 0,
					  distance: 100,
					  maxPatternLength: 32,
					  minMatchCharLength: 1,
					  keys: keys
					};
					var fuse = new Fuse(_filtrate, options);
					var result = fuse.search(query);

					var i;
					for (i = 0; i < result.length; i++) {
					  showIds.push(result[i]["key"]);
					  all_keys.pop(result[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}else{
				var _filtrate = [];
				//var _residue = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] <= startDate && jsonObj[key]["createdAt"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] <= startDate && jsonObj[key]["epoch"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] <= startDate && jsonObj[key]["epochPayed"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

			    var showIds = [];
				var hideIds = [];
				var keys = [];
				if(_filtrate.length > 0){
					Object.keys(_filtrate[0]).forEach(function(key) {
						keys.push(key);
				    });
					var options = {
					  shouldSort: true,
					  threshold: 0.6,
					  location: 0,
					  distance: 100,
					  maxPatternLength: 32,
					  minMatchCharLength: 1,
					  keys: keys
					};
					var fuse = new Fuse(_filtrate, options);
					var result = fuse.search(query);

					var i;
					for (i = 0; i < result.length; i++) {
					  showIds.push(result[i]["key"]);
					  all_keys.pop(result[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}
		}else{
			//startDate and endDate only
			if(startDate < endDate){
				var _filtrate = [];
				//var _residue = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] >= startDate && jsonObj[key]["createdAt"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] >= startDate && jsonObj[key]["epoch"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] >= startDate && jsonObj[key]["epochPayed"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });
			    var showIds = [];
			    var hideIds = [];
				if(_filtrate.length > 0){
					var i;
					for (i = 0; i < _filtrate.length; i++) {
					  	showIds.push(_filtrate[i]["key"]);
					  	all_keys.pop(_filtrate[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}else{
				var _filtrate = [];
				//var _residue = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] <= startDate && jsonObj[key]["createdAt"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] <= startDate && jsonObj[key]["epoch"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] <= startDate && jsonObj[key]["epochPayed"] >= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });
			    var showIds = [];
			    var hideIds = [];
				if(_filtrate.length > 0){
					var i;
					for (i = 0; i < _filtrate.length; i++) {
					  	showIds.push(_filtrate[i]["key"]);
					  	all_keys.pop(_filtrate[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}
		}
	}else{
		if(!isNullOrUndefinedOrEmpty(startDate)){
			if(!isNullOrUndefinedOrEmpty(query)){
				//startDate and Fuzzy
				var _filtrate = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

				var showIds = [];
				var hideIds = [];
				var keys = [];
				if(_filtrate.length > 0){
					Object.keys(_filtrate[0]).forEach(function(key) {
						keys.push(key);
				    });
					var options = {
					  shouldSort: true,
					  threshold: 0.6,
					  location: 0,
					  distance: 100,
					  maxPatternLength: 32,
					  minMatchCharLength: 1,
					  keys: keys
					};
					var fuse = new Fuse(_filtrate, options);
					var result = fuse.search(query);

					var i;
					for (i = 0; i < result.length; i++) {
					  showIds.push(result[i]["key"]);
					  all_keys.pop(result[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}else{
				//startDate only
				var _filtrate = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] >= startDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

				var showIds = [];
			    var hideIds = [];
				if(_filtrate.length > 0){
					var i;
					for (i = 0; i < _filtrate.length; i++) {
					  	showIds.push(_filtrate[i]["key"]);
					  	all_keys.pop(_filtrate[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}
		}

		if(!isNullOrUndefinedOrEmpty(endDate)){
			if(!isNullOrUndefinedOrEmpty(query)){
				//endDate and Fuzzy
				var _filtrate = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

				var showIds = [];
				var hideIds = [];
				var keys = [];
				if(_filtrate.length > 0){
					Object.keys(_filtrate[0]).forEach(function(key) {
						keys.push(key);
				    });
					var options = {
					  shouldSort: true,
					  threshold: 0.6,
					  location: 0,
					  distance: 100,
					  maxPatternLength: 32,
					  minMatchCharLength: 1,
					  keys: keys
					};
					var fuse = new Fuse(_filtrate, options);
					var result = fuse.search(query);

					var i;
					for (i = 0; i < result.length; i++) {
					  showIds.push(result[i]["key"]);
					  all_keys.pop(result[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}else{
				//endDate only
				var _filtrate = [];
				var all_keys = [];
				Object.keys(jsonObj).forEach(function(key) {
					all_keys.push(key);
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
						if(jsonObj[key]["createdAt"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["createdAt"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
						if(jsonObj[key]["epoch"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epoch"];
							_filtrate.push(jsonObj[key]);
						}
					}
					if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
						if(jsonObj[key]["epochPayed"] <= endDate){
							jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
							_filtrate.push(jsonObj[key]);
						}
					}
			    });

				var showIds = [];
			    var hideIds = [];
				if(_filtrate.length > 0){
					var i;
					for (i = 0; i < _filtrate.length; i++) {
					  	showIds.push(_filtrate[i]["key"]);
					  	all_keys.pop(_filtrate[i]["key"]);
					}
					response.status(200).json({"showIds" : showIds, "hideIds" : all_keys});
				}else{
					response.status(200).json({"showIds" : [], "hideIds" : all_keys});
				}
			}
		}

		if(isNullOrUndefinedOrEmpty(startDate) && isNullOrUndefinedOrEmpty(endDate) && !isNullOrUndefinedOrEmpty(query)){
			//Fuzzy only
			var _filtrate = [];
			var all_keys = [];
			Object.keys(jsonObj).forEach(function(key) {
				all_keys.push(key);
				if(!isNullOrUndefinedOrEmpty(jsonObj[key]["createdAt"])){
					jsonObj[key]["key"] = jsonObj[key]["createdAt"];
					_filtrate.push(jsonObj[key]);
				}
				if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epoch"])){
					jsonObj[key]["key"] = jsonObj[key]["epoch"];
					_filtrate.push(jsonObj[key]);
				}
				if(!isNullOrUndefinedOrEmpty(jsonObj[key]["epochPayed"])){
					jsonObj[key]["key"] = jsonObj[key]["epochPayed"];
					_filtrate.push(jsonObj[key]);
				}
		    });

			var showIds = [];
			var hideIds = [];
			var keys = [];
			if(_filtrate.length > 0){
				Object.keys(_filtrate[0]).forEach(function(key) {
					keys.push(key);
			    });
				var options = {
				  shouldSort: true,
				  threshold: 0.6,
				  location: 0,
				  distance: 100,
				  maxPatternLength: 32,
				  minMatchCharLength: 1,
				  keys: keys
				};
				var fuse = new Fuse(_filtrate, options);
				var result = fuse.search(query);

				var i;
				for (i = 0; i < result.length; i++) {
				  showIds.push(result[i]["key"]);
				}
				var i;
				for (i = 0; i < all_keys.length; i++) {
				  if(showIds.indexOf(all_keys[i]["key"]) <= -1){
				  	hideIds.push(all_keys[i]["key"]);
				  }
				}
				response.status(200).json({"showIds" : showIds, "hideIds" : hideIds});
			}else{
				response.status(200).json({"showIds" : [], "hideIds" : all_keys});
			}
			
		}
	}
});

app.get('/admin/get_profile/:uid', verifyToken, function(request, response){
	//var _in = request.body;
	var params = request.params;
	if(isNullOrUndefinedOrEmpty(params["uid"])){
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}else{
		mDb.get_user(params["uid"], null, request.headers.authorization, response, request, mDb, _auth.verifyIdToken(request.headers.authorization)["business"]);
	}
});

/*app.get('/admin/get_user_claims/:uid', verifyToken, function(request, response){
	//var _in = request.body;
	var params = request.params;
	if(isNullOrUndefinedOrEmpty(params["uid"])){
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}else{
		mAuth.get_user_claims(request.headers.authorization, response);
	}
});*/

app.post('/admin/signout/:uid', function(request, response){
	//var _in = request.body;
	var params = request.params;
	if(isNullOrUndefinedOrEmpty(params["uid"])){
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}else{
		mAuth.signout(params["uid"], response, mDb);
	}
});

app.post('/admin/report_error', json_parser, function(request, response){
	var _in = request.body;
	_in["epoch"] = `${Date.now()}`;
	mDb.save_error(_in, response);
});

app.post('/admin/register_business', isAdmin, json_parser, function(request, response){
	var _details = request.body;
	var pass_key = randStr.generate(8);

	var b_details = {};
	b_details["emailVerified"] = false;
	b_details["disabled"] = false;
	b_details["displayName"] = _details["displayName"];
	b_details["email"] = _details["email"];
	b_details["password"] = pass_key;
	b_details["phoneNumber"] = _details["phoneNumber"];
	b_details["photoURL"] = defaultPhotoURL;
	
	var other_details = {};
	other_details["addedBy"] = request.uid;
	if(!isNullOrUndefinedOrEmpty(_details["business_name"])){
		other_details["business_name"] = _details["business_name"];
	}else{
		response.status(400).json({
			"code" : "auth/no-business-name",
			"message" : "No business/organization/vendor name. business_name cannot be null, empty or undefined"
		});
		response.end();
	}

	if(!isNullOrUndefinedOrEmpty(_details["industry"])){
		other_details["industry"] = _details["industry"];
	}else{
		response.status(400).json({
			"code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}

	if(!isNullOrUndefinedOrEmpty(_details["percentage_charge"])){
		other_details["percentage_charge"] = _details["percentage_charge"];
	}else{
		response.status(400).json({
			"code" : "auth/no-percentage-charge",
			"message" : "No Percentage Charge. percentage_charge cannot be null, empty or undefined"
		});
		response.end();
	}
	
	/*
	if(!isNullOrUndefinedOrEmpty(_details["settlement_bank"])){
		other_details["settlement_bank "] = _details["settlement_bank "];
	}else{
		response.status(400).json({
			"code" : "auth/no-bank-name",
			"message" : "No bank name. settlement_bank cannot be null, empty or undefined"
		});
		response.end();
	}

	if(!isNullOrUndefinedOrEmpty(_details["account_number"])){
		other_details["account_number "] = _details["account_number "];
	}else{
		response.status(400).json({
			"code" : "auth/no-account-number",
			"message" : "No Account Number. account_number cannot be null, empty or undefined"
		});
		response.end();
	}
	*/
	mAuth.register_business(request.uid, b_details, other_details, response, mDb);
});

app.post('/admin/resend_email_verification', json_parser, function(request, response){
	var _details = request.body;
	var credential_name = _details["emailOrPhoneNumber"];
	//var credential_password = _details["password"];

	if(isNullOrUndefinedOrEmpty(credential_name)){
		var error = { "code": "auth/not-email-or-phone", "message": "This is neither an email address nor a phone number" }
		response.status(400).json(error);
		response.end();
	}else{
		mAuth.resend_email_verification(credential_name, response, mDb);
		//mAuth.resend_email_verification(credential_name, config["apiKey"], response, mDb);
	}
});

app.post('/admin/auth/updateOrCreateUser', isAdminOrBusiness, json_parser, function(request, response){
	var _details = request.body;
	var pass_key = randStr.generate(8);
	var new_data = request.body["newdata"];
	new_data["password"] = pass_key;

	if(!isNullOrUndefinedOrEmpty(new_data)){
		Object.keys(new_data).forEach(function(key) {
			_details[key] = new_data[key];
		});
		_details["newdata"] = null;

	_auth.getUserByEmail(_details['email'])
	    .then(function(userRecord) {
	    	//Update user
	    	if(request.email == _details["email"]){
				response.status(400).json({ "code" : "auth/failed-to-createOrUpdate",
					"message" : "You cannot perform an account creation or update through this means"
				});
				response.end();
			}

			var u_details = {};
			u_details["emailVerified"] = _details["emailVerified"];
			u_details["disabled"] = _details["disabled"];
			u_details["displayName"] = _details["displayName"];
			u_details["email"] = _details["email"];
			u_details["password"] = pass_key;
			u_details["phoneNumber"] = _details["phoneNumber"];
			if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
				u_details["photoURL"] = _details["photoURL"];
			}else{
				u_details["photoURL"] = defaultPhotoURL;
			}
			var other_details = {};
			Object.keys(_details).forEach(function(key) {
				if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
				other_details[key] = _details[key];
			});

			other_details["uid"] = _details["uid"];

			if(!isNullOrUndefinedOrEmpty(_details["industry"])){
				other_details["industry"] = _details["industry"];
			}else{
				response.status(400).json({ "code" : "auth/industry",
					"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
				});
				response.end();
			}
			mAuth.updateUser(u_details, other_details, response, request, mDb);
	    })
	    .catch(function(error) {
	    	
	    	_auth.getUserByPhoneNumber(_details['phoneNumber'])
			    .then(function(userRecord) {
			    	//Update user
			    	if(request.email == _details["email"]){
						response.status(400).json({ "code" : "auth/failed-to-createOrUpdate",
							"message" : "You cannot perform an account creation or update through this means"
						});
						response.end();
					}

					var u_details = {};
					u_details["emailVerified"] = _details["emailVerified"];
					u_details["disabled"] = _details["disabled"];
					u_details["displayName"] = _details["displayName"];
					u_details["email"] = _details["email"];
					u_details["password"] = pass_key;
					u_details["phoneNumber"] = _details["phoneNumber"];
					if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
						u_details["photoURL"] = _details["photoURL"];
					}else{
						u_details["photoURL"] = defaultPhotoURL;
					}
					
					
					var other_details = {};
					Object.keys(_details).forEach(function(key) {
						if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
						other_details[key] = _details[key];
					});

					other_details["uid"] = _details["uid"];

					if(!isNullOrUndefinedOrEmpty(_details["industry"])){
						other_details["industry"] = _details["industry"];
					}else{
						response.status(400).json({ "code" : "auth/industry",
							"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
						});
						response.end();
					}
					mAuth.updateUser(u_details, other_details, response, request, mDb);

			    })
			    .catch(function(error) {
			    	//Create new user
					if(!_details["email"].endsWith(request.email.split('@')[1])){
						if(request.business || request.staff){
							//Can only create user with the same organization email
							response.status(400).json({ "code" : "auth/invalid-email-host",
								"message" : "Can only create/update user from the same organization"
							});
							response.end();
						}
					}

					var u_details = {};
					u_details["emailVerified"] = _details["emailVerified"];
					u_details["disabled"] = _details["disabled"];
					u_details["displayName"] = _details["displayName"];
					u_details["email"] = _details["email"];
					u_details["password"] = pass_key;
					u_details["phoneNumber"] = _details["phoneNumber"];
					if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
						u_details["photoURL"] = _details["photoURL"];
					}else{
						u_details["photoURL"] = defaultPhotoURL;
					}
					
					
					var other_details = {};
					Object.keys(_details).forEach(function(key) {
						if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
						other_details[key] = _details[key];
					});

					other_details["uid"] = _details["uid"];

					if(!isNullOrUndefinedOrEmpty(_details["industry"])){
						other_details["industry"] = _details["industry"];
					}else{
						response.status(400).json({ "code" : "auth/industry",
							"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
						});
						response.end();
					}
					mAuth.createUser(u_details, other_details, response, request, mDb);
			  	});

	  	});
	}else{
		response.status(400).json({ "code" : "auth/no-new-data",
									"message" : "No new information found"
								});
		response.end();
	}	
});

app.post('/admin/auth/update_profile', verifyToken, json_parser, function(request, response){
	var _details = request.body;
	var pass_key = randStr.generate(8);
	var new_data = request.body["newdata"];
	Object.keys(new_data).forEach(function(key) {
		if(!isNullOrUndefinedOrEmpty(new_data[key])){
			_details[key] = new_data[key];
		}
	});
	_details["newdata"] = null;

	var u_details = {};
	u_details["emailVerified"] = _details["emailVerified"];
	u_details["disabled"] = _details["disabled"];
	u_details["displayName"] = _details["displayName"];
	u_details["email"] = _details["email"];
	u_details["password"] = pass_key;
	u_details["phoneNumber"] = _details["phoneNumber"];
	if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
		u_details["photoURL"] = _details["photoURL"];
	}else{
		u_details["photoURL"] = defaultPhotoURL;
	}
	
	var other_details = {};
	Object.keys(_details).forEach(function(key) {
		if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
		other_details[key] = _details[key];
	});

	other_details["uid"] = _details["uid"];

	if(!isNullOrUndefinedOrEmpty(_details["industry"])){
		other_details["industry"] = _details["industry"];
	}else{
		response.status(400).json({ "code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}
	mAuth.updateUser(u_details, other_details, response, request, mDb);
});

app.post('/admin/auth/disableUser', isAdminOrBusiness, json_parser, function(request, response){
	var pass_key = randStr.generate(8);
	var _details = request.body;
	var new_data = request.body["newdata"];
	Object.keys(new_data).forEach(function(key) {
		_details[key] = new_data[key];
	});
	_details["newdata"] = null;

	var u_details = {};
	u_details["emailVerified"] = _details["emailVerified"];
	u_details["disabled"] = _details["disabled"];
	u_details["displayName"] = _details["displayName"];
	u_details["email"] = _details["email"];
	u_details["password"] = pass_key;
	u_details["phoneNumber"] = _details["phoneNumber"];

	if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
		u_details["photoURL"] = _details["photoURL"];
	}else{
		u_details["photoURL"] = defaultPhotoURL;
	}
	
	var other_details = {};
	Object.keys(_details).forEach(function(key) {
		if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
		other_details[key] = _details[key];
	});

	other_details["uid"] = _details["uid"];

	if(!isNullOrUndefinedOrEmpty(_details["industry"])){
		other_details["industry"] = _details["industry"];
	}else{
		response.status(400).json({ "code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}

	if(!other_details["isAdmin"]){
		mAuth.disableUser(u_details, other_details, response, request, mDb);
	}else{
		response.status(400).json({ "code" : "auth/not-authorized",
			"message" : "You cannot disable an administrators"
		});
		response.end();
	}
});

app.post('/admin/auth/deleteUser', isAdmin, json_parser, function(request, response){
	var _details = request.body;
	if(isNullOrUndefinedOrEmpty(_details["uid"])){
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}else{
		mAuth.deleteUser(_details, response, request, mDb);
	}
});

/*app.post('/admin/reset_password', json_parser, isAdminOrBusiness, function(request, response){
	var _details = request.body;
	var credential_name = _details["emailOrPhoneNumber"];
	//var credential_password = _details["password"];

	if(isNullOrUndefinedOrEmpty(credential_name)){
		var error = { "code": "auth/not-email-or-phone", "message": "This is neither an email address nor a phone number" }
		response.status(400).json(error);
		response.end();
	}else{
		mAuth.reset_password(credential_name, response, mDb);
	}
});*/

app.get('/admin/db/industries', function(request, response){
	mDb.get_industry(response);
});

app.get('/admin/payment/get_paystack_keys', verifyToken, function(request, response){
	mDb.get_paystack_keys(response);
});

app.get('/admin/payment/get_rave_keys', verifyToken, function(request, response){
	var keys = { 'PBFPubKey': rave_keys['publicKey'], 'PBFSecKey': rave_keys['secretKey']  };
	response.status(200).json(keys);
});

app.post('/admin/payment/update_transaction', isAdminOrBusinessOrStaff, json_parser, function(request, response){
	var _details = request.body;
	mDb.update_transaction(request.uid, _details, response, mDb);
});

app.post('/admin/chat/save_conversation', verifyToken, json_parser, function(request, response){
	var _details = request.body;
	_details["conversationId"] = '' + Math.floor((Math.random() * 1000000000) + 1);
	mDb.save_conversation(request.uid, _details, response, mDb);
});

app.get('/admin/get_credentials', verifyToken, function(request, response){
	response.status(200).json({ "preset" : config, "refEndpoint" : "users/"+request.uid });
});

app.post('/test', json_parser, function(request, response){
	var _details = request.body;
	var pass_key = randStr.generate(8);
	var new_data = request.body["newdata"];

	Object.keys(new_data).forEach(function(key) {
		_details[key] = new_data[key];
	});
	_details["newdata"] = null;

	response.status(200).json(_details);

	//var administrators = ['obagbemisoye', 'adewusijohnson'];
	//response.status(200).send(`${ request.params["name"].toLowerCase().split(" ").join("").indexOf(administrators[1]) }`);
});

app.post('/admin/notification', json_parser, function(request, response){
	var _details = request.body;
	//var registrationToken = 'YOUR_REGISTRATION_TOKEN';
	//var message = {
	//	notification: {
	//		title: '$GOOG up 1.43% on the day',
	//		body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
	//	},
	//	token: registrationToken
	//};
	
	// Send a message to devices subscribed to the combination of topics
	// specified by the provided condition.
	admin.messaging().send(_details)
		.then((response) => {
			// Response is a message ID string.
			console.log('Successfully sent message:', response);
		})
		.catch((error) => {
			response.status(400).json(error);
		});
});

/*
app.post('/signin-form', (request, response) => {
  var username = request.body.username
  response.end()
});
app.get('/', function (request, response) {
  console.log("HTTP Get Request");
  response.send("HTTP GET Request");
});
app.put('/', function (request, response) {
  console.log("HTTP Put Request");
  response.send("HTTP PUT Request");
});
app.post('/', function (request, response) {
  console.log("HTTP POST Request");
  response.send("HTTP POST Request");  
});
app.delete('/', function (request, response) {
  console.log("HTTP DELETE Request");
  response.send("HTTP DELETE Request");
});
*/


/*var port = process.env.PORT || 80;
var server = app.listen(port, function () {
    console.log('node.js static server listening on port: ' + port + ", with websockets listener")
})

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', function(ws){

	//connection is up, let's add a simple simple event
	ws.on('message', function(message){
		//log the received message and send it back to the client
        console.log('received: %s', message);
	});

	//send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});*/

exports.app = functions.https.onRequest(app);