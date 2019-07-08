var _db;

function db() {
}

db.prototype.shareApp = function(iapp) {
	_db = iapp.database();
};

module.exports = db;