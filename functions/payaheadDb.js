var _db;

function payaheadDb() {
}

payaheadDb.prototype.shareApp = function(idb) {
	_db = idb;
};

payaheadDb.prototype.set_user = function(uj, response) {
  _db.ref("users/" + uj["uid"]).set(
    uj, 
    function(error) {
      if (error) {
      	response.json(error);
      } else {
        // Data saved successfully!
      }
    }
  );
};

module.exports = payaheadDb;