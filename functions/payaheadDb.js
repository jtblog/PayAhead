var _db;
var industry_ref

function payaheadDb() {
}

payaheadDb.prototype.shareApp = function(idb) {
	_db = idb;
  industry_ref = _db.ref('/industry/');
};

payaheadDb.prototype.set_user = function(uj, _respond) {
  _db.ref("users/" + uj["uid"]).set(
  	uj
  	, function(error) {
        if (error) {
          _respond(error, 404);
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
      _respond(error, 404);
    }
  );
}

payaheadDb.prototype.get_user = function(uj, _respond){
  _db.ref("users/" + uj["uid"]).once('value').then(
    function(snapshot) {
      _respond(snapshot.val(), 200);
    },
    function(error) {
      _respond(error, 404);
    }
  );
}

module.exports = payaheadDb;