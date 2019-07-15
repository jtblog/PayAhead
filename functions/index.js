const functions = require('firebase-functions');
const admin = require('firebase-admin');
global.firebase = require('firebase');

const express = require('express');
const path = require('path');

const serviceAccount  = require('./payahead-80360-firebase-adminsdk-0862z-b5e58ff081.json');
global.mAuth = require('./payaheadAuth');
global.mdb = require('./payaheadDb');
global.pay = require('./pay');

const router = express.Router();
const app = express();

app.use(express.urlencoded());

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
mdb = new mdb();
pay = new pay();
global.payahead_auth = firebase.auth();
global.payahead_db = firebase.database();
mAuth.shareApp(payahead_auth, defaultApp);
mdb.shareApp(payahead_db);

router.get('/',function(request, response){
  response.sendFile(path.join(__dirname.replace("functions", "public")+'/index.html'));
});

router.get('/signin',function(request, response){
  response.sendFile(path.join(__dirname.replace("functions", "public")+'/signin.html'));
});

router.get('/signup',function(request, response){
  response.sendFile(path.join(__dirname.replace("functions", "public")+'/signup.html'));
});

router.post('/auth/signin', function(request, response){
	const credential_name = JSON.parse(ts(request.body)).emailOrPhoneNumber;
	const credential_password = JSON.parse(ts(request.body)).password;
	mAuth.signin(credential_name, credential_password, response);
});

router.post('/auth/signup', function(request, response){
	const _details = JSON.parse(ts(request.body));
	const su_details = {};
	su_details["emailVerified"] = false;
	su_details["disabled"] = false;
	su_details["displayName"] = _details["displayName"];
	su_details["email"] = _details["email"];
	su_details["password"] = _details["password"];
	su_details["phoneNumber"] = _details["phoneNumber"];
	if(_details["photoURL"] == "" || _details["photoURL"] == null || typeof(_details["photoURL"]) == undefined){
		su_details["photoURL"] = "https://firebasestorage.googleapis.com/v0/b/payahead-80360.appspot.com/o/index.png?alt=media&token=66c38ec1-6bb7-4aa6-ad09-8b394acd390f";
	}
	
	const other_details = {};
	if(_details["bvn"] == null || typeof(_details["bvn"]) == undefined){
		response.json({
			"code" : "auth/bvn",
			"message" : "BVN is not attached or is invalid"
		});
		response.end();
	}else{
		other_details["bvn"] = _details["bvn"];
	}
	if(_details["industry"] == null || typeof(_details["industry"]) == undefined){
		response.json({
			"code" : "auth/industry",
			"message" : "Industry is not attached or is invalid"
		});
		response.end();
	}else{
		other_details["industry"] = _details["industry"];
	}
	mAuth.signup(su_details, other_details, this.mdb, response);
});

function ts(_in) {
	return ""+_in.replace(/'/g, '"');
}

router.post('/payment/initialize', function(request, response){
	const p_details = JSON.parse(request.body);
	pay.initialize(p_details, response);
});

/*
app.post('/signin-form', (request, response) => {
  const username = request.body.username
  response.end()
});
*/

app.use('/', router);

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