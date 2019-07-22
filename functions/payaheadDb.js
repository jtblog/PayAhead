var _db;
var industry_ref;
var users_ref;

function payaheadDb() {
}

payaheadDb.prototype.shareApp = function(idb) {
	_db = idb;
  industry_ref = _db.ref('/industry/');
  users_ref = _db.ref('/users/');
};

payaheadDb.prototype.set_user = function(uj, _respond) {
  _db.ref("users/" + uj["uid"]).set(
  	uj
  	, function(error) {
        if (error) {
          console.log(error);
          _respond(error, 400);
        } else {
          _respond(uj, 200);
        }
    });
};

payaheadDb.prototype.get_industry = function(_respond){
  var industries = [];
  industry_ref.orderByKey().once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          industries.push(childSnapshot.val());
        }
      )
      _respond(industries, 200);
    },
    function(error) {
      console.log(error);
      _respond(error, 400);
    }
  );
}

payaheadDb.prototype.get_user = function(uid, authorization, _respond){
  
  _db.ref("users/" + uid).once("value", function(data) {
      if (data) {
        _respond( {"authorization" : authorization, "user" : data }, 200 );
      } else {
         console.log(error);
        _respond(error, 400);
      }
  });

}

module.exports = payaheadDb;