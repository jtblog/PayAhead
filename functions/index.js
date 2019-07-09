const functions = require('firebase-functions');
const admin = require('firebase-admin');
var firebase = require('firebase');
//console.log(firebase.auth);

const express = require('express');
const path = require('path');

const serviceAccount  = require('./payahead-80360-firebase-adminsdk-0862z-b5e58ff081.json');
var mAuth = require('./payaheadAuth');
var db = require('./db');
var pay = require('./pay');

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
db = new db();
pay = new pay();
mAuth.shareApp(defaultApp);
db.shareApp(defaultApp);

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
	//const credential_name = JSON.parse(request.body).emailOrPhoneNumber;
	//const credential_password = JSON.parse(request.body).password;
	//mAuth.signin(credential_name, credential_password, response);
	/*firebase.auth().signInWithEmailAndPassword("joetfx@hotmail.com", "06143460AI")
  	.then(function(user) {
  		response.json(user);
	})
  	.catch(function(error) {
	  //var errorCode = error.code;
	  //var errorMessage = error.message;
	  response.json(error);
	});*/
});

router.post('/auth/signup', function(request, response){
	/*const su_details = JSON.parse(request.body);
	mAuth.signup(su_details, response);*/
});

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



//"axios": "^0.19.0",
    //"body-parser": "^1.19.0",
    //"express": "^4.17.1",
    //"firebase-functions": "^3.0.0",
    //"google-libphonenumber": "^3.2.3",
   // "libphonenumber": "0.0.10",
    //"libphonenumber-js": "^1.7.20",
    //"paystack": "^2.0.1",
    //"validator": "^11.1.0"