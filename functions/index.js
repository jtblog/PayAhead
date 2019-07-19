const functions = require('firebase-functions');
const admin = require('firebase-admin');
global.firebase = require('firebase');
global.needle = require('needle');
global.storage = require('node-persist');
storage.init();

const express = require('express');
const path = require('path');

const serviceAccount  = require('./payahead-firebase-adminsdk-credentials.json');
global.mAuth = require('./payaheadAuth');
global.mDb = require('./payaheadDb');
global.mPay = require('./payaheadPay');
global.resp;
global.reqst;

const unsecured_router = express.Router();
const secured_router = express.Router();
const app = express();

global.config = {
    "apiKey": "AIzaSyCYLDTKAfXBgAdF6hqF3qsSYo1o-2WHo7s",
    "databaseURL": "https://payahead-80360.firebaseio.com",
    "storageBucket": "payahead-80360.appspot.com",
    "authDomain": "payahead-80360.firebaseapp.com",
    "messagingSenderId": "392417005472",
    "projectId": "payahead-80360"
};
firebase.initializeApp(config);

// Initialize the default app
global.defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://payahead-80360.firebaseio.com"
});

mAuth = new mAuth();
mDb = new mDb();
mPay = new mPay();
global.payahead_auth = firebase.auth();
//global.payahead_db = firebase.database();
global._auth = defaultApp.auth();
global._db = defaultApp.database();
mAuth.shareApp(payahead_auth, defaultApp, _db);
//mDb.shareApp(payahead_db);
mDb.shareApp(_db);

function verifyToken(request, response, next){
	reqst = request;
	resp = response;
	const idToken = reqst.headers.authorization;

	try{
		const _ctoken = _auth.verifyIdToken(idToken);
		if(_ctoken){
			reqst.body.uid = _ctoken.uid;
			return next();
		}else{
			resp.status(401).send('Unauthorized');
		}
	}catch(e){
		resp.status(401).send('Unauthorized');
	}
};

function ts(_in) {
	return ""+_in.replace(/'/g, '"');
};

function _respond(_in){
	resp.json(_in);
};

function _post_request(_in, base_url){
	storage.setItem('user', _in);
	var url = reqst.protocol + "://" + reqst.headers['x-forwarded-host'] +  base_url;
	needle.post(url, _in, 
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
	            resp.json(error);
	        }
	    }
	   );
};

function _save_authorization_data(_in){
	storage.setItem('authorization_data', _in);
	resp.redirect(_in.authorization_url);
};

unsecured_router.get('/',function(request, response){
  response.sendFile(path.join(__dirname.replace("functions", "public")+'/index.html'));
});

unsecured_router.get('/signin',function(request, response){
  response.sendFile(path.join(__dirname.replace("functions", "public")+'/signin.html'));
});

unsecured_router.get('/signup',function(request, response){
  response.sendFile(path.join(__dirname.replace("functions", "public")+'/signup.html'));
});

unsecured_router.post('/auth/signin', function(request, response){
	resp = response;
	reqst = request;
	const credential_name = JSON.parse(ts(request.body)).emailOrPhoneNumber;
	const credential_password = JSON.parse(ts(request.body)).password;
	mAuth.signin(credential_name, credential_password, _respond);
});

unsecured_router.post('/auth/signup', function(request, response){
	resp = response;
	reqst = request;
	const _details = JSON.parse(ts(request.body));
	const su_details = {};
	su_details["emailVerified"] = false;
	su_details["disabled"] = false;
	su_details["displayName"] = _details["displayName"];
	su_details["email"] = _details["email"];
	su_details["password"] = _details["password"];
	su_details["phoneNumber"] = _details["phoneNumber"];
	if(_details["photoURL"] === "" || _details["photoURL"] === null || typeof(_details["photoURL"]) === undefined){
		su_details["photoURL"] = "https://firebasestorage.googleapis.com/v0/b/payahead-80360.appspot.com/o/index.png?alt=media&token=66c38ec1-6bb7-4aa6-ad09-8b394acd390f";
	}
	
	const other_details = {};
	if(_details["bvn"] === null || typeof(_details["bvn"]) === undefined){
		response.json({
			"code" : "auth/bvn",
			"message" : "BVN is not attached or is invalid"
		});
		response.end();
	}else{
		other_details["bvn"] = _details["bvn"];
	}
	if(_details["industry"] === null || typeof(_details["industry"]) === undefined){
		response.json({
			"code" : "auth/industry",
			"message" : "Industry is not attached or is invalid"
		});
		response.end();
	}else{
		other_details["industry"] = _details["industry"];
	}
	mAuth.signup(su_details, other_details, _respond, _post_request);
});

secured_router.post('/ping', function(request, response){
	resp = response;
	reqst = request;
	_respond('pong');
});

secured_router.post('/payment/initialize', function(request, response){
	resp = response;
	reqst = request;
	const p_details = JSON.parse(ts(request.body));
	mPay.initialize(p_details, _save_authorization_data);
});

unsecured_router.post('/writeNewUser', function(request, response){
	resp = response;
	reqst = request;
	storage.getItem('user').then(function(user){
		mDb.set_user(user, _respond);
	});
});

unsecured_router.get('/industries', function(request, response){
	resp = response;
	reqst = request;
	mDb.get_industry(_respond);
});

secured_router.get('/get_profile', function(request, response){
	resp = response;
	reqst = request;
	const _in = JSON.parse(ts(request.body));
	if(_in["uid"] != null || _in["uid"] != "" || typeof(_in["uid"]) != undefined){
		mDb.get_user(_in, _respond);
	}else{
		var err = {
    			"code": "db/bad-uid",
    			"message": "uid cannot be empty, null or undefined"
			}
		_respond(err);
	}
});

secured_router.post('/update_profile', function(request, response){
	resp = response;
	reqst = request;

	/*
	storage.getItem('user').then(function(user){
		mDb.set_user(user, _respond);
	});*/
});

app.use('/', unsecured_router);
app.use('/', verifyToken, secured_router);
app.use(_respond);
app.use(_post_request);
app.use(_save_authorization_data);

/*
app.post('/signin-form', (request, response) => {
  const username = request.body.username
  response.end()
});
*/

/*
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