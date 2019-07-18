var _db;

function payaheadDb() {
}

payaheadDb.prototype.shareApp = function(idb) {
	_db = idb;
};

payaheadDb.prototype.set_user = function(uj, _respond) {
  _db.ref("users/" + uj["uid"]).set(
  	uj
  	, function(error) {
    if (error) {
      _respond(error);
    } else {
      _respond(uj);
    }
  });
};

payaheadDb.prototype.get_industry = function(response){

}

module.exports = payaheadDb;