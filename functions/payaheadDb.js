var _db;
var industry_ref, paystack_keys_ref;
var users_ref;

function payaheadDb() {
}

payaheadDb.prototype.shareApp = function(idb) {
	_db = idb;
  industry_ref = _db.ref('/industry/');
  paystack_keys_ref = _db.ref('/paystack/keys/');
  users_ref = _db.ref('/users/');
};

payaheadDb.prototype.set_user = function(uj, response) {
  _db.ref("users/" + uj["uid"]).set(
  	uj
  	, function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {
          response.status(200).json(uj);
        }
    });
};

payaheadDb.prototype.create_user = function(uj, response) {
  _db.ref("users/" + uj["uid"]).push(
    uj
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {
          response.status(200).json(uj);
        }
    });
};

payaheadDb.prototype.set_authorization = function(baseurl, _in, response){
  _db.ref("authorization/" + baseurl).set(
    _in
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {
          response.status(200).json(_in);
        }
    }
  );
};

payaheadDb.prototype.get_industry = function(response){
  var industries = [];
  industry_ref.orderByKey().once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          industries.push(childSnapshot.val());
        }
      )
      response.status(200).json(industries);
    },
    function(error) {
      console.log(error);
      response.status(400).json(error);
    }
  );
};

payaheadDb.prototype.get_user = function(uid, authorization, response){
  
  _db.ref("users/" + uid).once("value", function(data) {
      if (data) {
        response.status(200).json({"authorization" : authorization, "user" : data });
      } else {
        console.log(error);
        response.status(400).json(error);
      }
  });
};

payaheadDb.prototype.get_paystack_keys = function(response){
  var keys = {};
  paystack_keys_ref.orderByKey().once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          keys[childSnapshot.key] = childSnapshot.val();
        }
      )
      response.status(200).json(keys);
    },
    function(error) {
      console.log(error);
      response.status(400).json(error);
    }
  );
};

payaheadDb.prototype.save_error = function(_in, response){

  _db.ref("logs/" + _in["epoch"]).set(
    _in
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {
          response.status(200).json(_in);
        }
    });
};

module.exports = payaheadDb;