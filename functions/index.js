var functions = require('firebase-functions');
var admin = require('firebase-admin');
var firebase = require('firebase');
var randStr = require('randomstring');

var parser = require('body-parser');
var json_parser = parser.json( { type: "application/*+json" } );
//var urlencoded_parser = parser.urlencoded( { extended : false } );
//var raw_parser = parser.raw( { type : 'application/vnd.custom-type' } );
//var text_parser = parser.text( { type : 'text/html' } );

var express = require('express');

var serviceAccount  = require('./payahead-firebase-adminsdk-credentials.json');
var config  = require('./payahead-firebase-javascriptsdk-credentials.json');
var mAuth = require('./payaheadAuth');
var mDb = require('./payaheadDb');
var mPay = require('./payaheadPay');

var app = express();
var cors = require('cors');
app.use(cors());

firebase.initializeApp(config);

// Initialize the default app
var defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://payahead-80360.firebaseio.com"
});

mAuth = new mAuth();
mDb = new mDb();
mPay = new mPay();

var payahead_auth = firebase.auth();
//global.payahead_db = firebase.database();
var _auth = defaultApp.auth();
var _db = defaultApp.database();
mAuth.shareApp(payahead_auth, defaultApp, _db);
//mDb.shareApp(payahead_db);
mDb.shareApp(_db);

var isNullOrUndefinedOrEmpty = function(_in){
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
  }
};

function verifyToken(request, response, next){
	var idToken = request.headers.authorization;

	_auth.verifyIdToken(idToken).then(function(decodedToken) {
		if(decodedToken){
			//request.body["uid"] = _ctoken.uid;
			request.uid = decodedToken["uid"];
			request.email = decodedToken["email"];
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
			return next();
		}else{
			response.status(401).send({"code": "auth/not-logged-in", "message" : "This Priviledge is only granted to PayAhead's logged in users"});
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
			return next();
		}else{
			response.status(401).send({"code": "auth/not-logged-in", "message" : "This Priviledge is only granted to PayAhead's logged in users"});
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
			return next();
		}else{
			response.status(401).send({"code": "auth/not-logged-in", "message" : "This Priviledge is only granted to PayAhead's logged in users"});
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
			return next();
		}else{
			response.status(401).send({"code": "auth/not-logged-in", "message" : "This Priviledge is only granted to PayAhead's logged in users"});
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
			return next();
		}else{
			response.status(401).send({"code": "auth/not-logged-in", "message" : "This Priviledge is only granted to PayAhead's logged in users"});
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
	su_details["photoURL"] = "https://firebasestorage.googleapis.com/v0/b/payahead-80360.appspot.com/o/index.png?alt=media&token=66c38ec1-6bb7-4aa6-ad09-8b394acd390f";
	
	var other_details = {};
	if(isNullOrUndefinedOrEmpty(_details["bvn"])){
		response.status(400).json( { "code" : "auth/bvn",
			"message" : "BVN is not attached or is invalid. bvn cannot be null, empty or undefined"
		});
		response.end();
	}else{
		other_details["bvn"] = _details["bvn"];
	}

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

app.post('/update_profile', verifyToken, json_parser, function(request, response){
	var _details = request.body
	var u_details = {};
	u_details["emailVerified"] = _details["emailVerified"];
	u_details["disabled"] = _details["disabled"];
	u_details["displayName"] = _details["displayName"];
	u_details["email"] = _details["email"];
	u_details["password"] = _details["password"];
	u_details["phoneNumber"] = _details["phoneNumber"];

	if(!isNullOrUndefinedOrEmpty(_details["photoURL"])){
		u_details["photoURL"] = _details["photoURL"];
	}else{
		u_details["photoURL"] = "https://firebasestorage.googleapis.com/v0/b/payahead-80360.appspot.com/o/index.png?alt=media&token=66c38ec1-6bb7-4aa6-ad09-8b394acd390f";
	}
	
	
	var other_details = {};
	Object.keys(_details).forEach(function(key) {
		if(!(key == "photoURL" || key == "phoneNumber" || key == "password" || key == "email" || key == "displayName" || key == "disabled" || key == "emailVerified"))
		other_details[key] = _details[key];
	});

	other_details["uid"] = _details["uid"];

	if(!isNullOrUndefinedOrEmpty(_details["bvn"])){
		other_details["bvn"] = _details["bvn"];
	}else{
		response.status(400).json({ "code" : "auth/bvn",
			"message" : "BVN is not attached or is invalid. bvn cannot be null, empty or undefined"
		});
		response.end();
	}

	if(!isNullOrUndefinedOrEmpty(_details["industry"])){
		other_details["industry"] = _details["industry"];
	}else{
		response.status(400).json({ "code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}

	mAuth.update_profile(request.uid, u_details, other_details, response, mDb);
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
	mDb.save_tranaction(request.uid, _details, response, mDb);
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
	b_details["photoURL"] = "https://firebasestorage.googleapis.com/v0/b/payahead-80360.appspot.com/o/index.png?alt=media&token=66c38ec1-6bb7-4aa6-ad09-8b394acd390f";
	
	var other_details = {};
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

app.post('/admin/reset_password', json_parser, isAdminOrBusiness, function(request, response){
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

app.get('/admin/db/industries', function(request, response){
	mDb.get_industry(response);
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

exports.app = functions.https.onRequest(app);