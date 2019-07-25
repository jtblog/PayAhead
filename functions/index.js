var functions = require('firebase-functions');
var admin = require('firebase-admin');
var firebase = require('firebase');

var parser = require('body-parser');
var json_parser = parser.json( { type: "application/*+json" } );
//var urlencoded_parser = parser.urlencoded( { extended : false } );
//var raw_parser = parser.raw( { type : 'application/vnd.custom-type' } );
//var text_parser = parser.text( { type : 'text/html' } );

var express = require('express');

var serviceAccount  = require('./payahead-firebase-adminsdk-credentials.json');
var mAuth = require('./payaheadAuth');
var mDb = require('./payaheadDb');
var mPay = require('./payaheadPay');

var app = express();
var cors = require('cors');
app.use(cors());

var config = {
    "apiKey": "AIzaSyCYLDTKAfXBgAdF6hqF3qsSYo1o-2WHo7s",
    "databaseURL": "https://payahead-80360.firebaseio.com",
    "storageBucket": "payahead-80360.appspot.com",
    "authDomain": "payahead-80360.firebaseapp.com",
    "messagingSenderId": "392417005472",
    "projectId": "payahead-80360"
};
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

function verifyToken(request, response, next){
	var idToken = request.headers.authorization;

	try{
		var _ctoken = _auth.verifyIdToken(idToken);
		if(_ctoken){
			//request.body["uid"] = _ctoken.uid;
			return next();
		}else{
			response.status(401).send('Unauthorized');
		}
	}catch(e){
		response.status(401).send('Unauthorized');
	}
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

app.post('/auth/signin', json_parser, function(request, response){
	var credential_name = request.body["emailOrPhoneNumber"];
	var credential_password = request.body["password"];
	mAuth.signin(credential_name, credential_password, response, mDb);
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
	if(_details["bvn"] !== null || _details["bvn"] !== "" || typeof(_details["bvn"]) !== undefined){
		other_details["bvn"] = _details["bvn"];
	}else{
		response.json({
			"code" : "auth/bvn",
			"message" : "BVN is not attached or is invalid. bvn cannot be null, empty or undefined"
		});
		response.end();
	}

	if(_details["industry"] !== null || _details["industry"] !== "" || typeof(_details["industry"]) !== undefined){
		other_details["industry"] = _details["industry"];
	}else{
		response.json({
			"code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}
	mAuth.signup(su_details, other_details, response, mDb);
});

/*app.get('/ping', verifyToken, json_parser, function(request, response){
	response.status(200).send('pong');
});*/

app.post('/payment/initialize', verifyToken, json_parser, function(request, response){
	var p_details = request.body;
	mPay.initialize(p_details, response, mDb);
});

app.post('/payment/initialize', json_parser, function(request, response){
	var p_details = request.body;
	mPay.initialize(p_details, response, mDb);
});

app.get('/db/industries', function(request, response){
	mDb.get_industry(response);
});

app.get('/get_profile/:uid', verifyToken, function(request, response){
	//var _in = request.body;
	var params = request.params;
	if(params["uid"] !== null || params["uid"] !== "" || typeof(params["uid"]) !== undefined){
		mDb.get_user(params["uid"], request.headers.authorization, response);
	}else{
		var error = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}
});

app.post('/update_profile', verifyToken, json_parser, function(request, response){
	var _details = request.body
	var u_details = {};
	u_details["emailVerified"] = _details["emailVerified"];
	u_details["disabled"] = _details["disabled"];
	u_details["displayName"] = _details["displayName"];
	u_details["email"] = _details["email"];
	u_details["password"] = _details["password"];
	u_details["phoneNumber"] = _details["phoneNumber"];
	if(_details["photoURL"] !== "" || _details["photoURL"] !== null || typeof(_details["photoURL"]) !== undefined){
		u_details["photoURL"] = _details["photoURL"];
	}else{
		u_details["photoURL"] = "https://firebasestorage.googleapis.com/v0/b/payahead-80360.appspot.com/o/index.png?alt=media&token=66c38ec1-6bb7-4aa6-ad09-8b394acd390f";
	}
	
	var other_details = {};
	Object.keys(_details).forEach(function(key) {
		if(key !== "photoURL" || key !== "phoneNumber" || key !== "password" || key !== "email" || key !== "displayName" || key !== "disabled" || key !== "emailVerified")
		other_details[key] = _details[key];
	});

	other_details["uid"] = _details["uid"];

	if(_details["bvn"] !== null || _details["bvn"] !== "" || typeof(_details["bvn"]) !== undefined){
		other_details["bvn"] = _details["bvn"];
	}else{
		response.json({
			"code" : "auth/bvn",
			"message" : "BVN is not attached or is invalid. bvn cannot be null, empty or undefined"
		});
		response.end();
	}

	if(_details["industry"] !== null || _details["industry"] !== "" || typeof(_details["industry"]) !== undefined){
		other_details["industry"] = _details["industry"];
	}else{
		response.json({
			"code" : "auth/industry",
			"message" : "Industry is not attached or is invalid. industry cannot be null, empty or undefined"
		});
		response.end();
	}
	mAuth.update_profile(u_details, other_details, response, mDb);
});

app.post('/signout/:uid', function(request, response){
	//var _in = request.body;
	var params = request.params;
	if(params["uid"] !== null || params["uid"] !== "" || typeof(params["uid"]) !== undefined){
		mAuth.signout(params["uid"], response);
	}else{
		var err = {
    		"code": "db/bad-uid",
    		"message": "UserID is not attached or is invalid. uid cannot be empty, null or undefined"
		}
		response.status(400).json(error);
	}
});

app.get('/payment/get_paystack_keys', verifyToken, json_parser, function(request, response){
	mDb.get_paystack_keys(response);
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