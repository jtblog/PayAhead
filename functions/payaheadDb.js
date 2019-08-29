var _db;
var industry_ref, paystack_keys_ref, transactions_ref;
var users_ref;
var isNullOrUndefinedOrEmpty;

function payaheadDb() {
  isNullOrUndefinedOrEmpty = function(_in){
    switch(_in){
      case null:
        return true;
        break;
      case undefined:
        return true;
        break;
      case "null":
        return true;
        break;
      case "undefined":
        return true;
        break;
      default:
        return false;
        break;
    };

    if(typeof _in == "string"){
      if(_in.trim() == ""){
        return true;
      }
    }else if(typeof _in == "undefined"){
      return true;
    };
  };
}

/*payaheadDb.prototype.isNullOrUndefinedOrEmpty = function(_in){
  switch(_in){
    case null:
      return true;
      break;
    case undefined:
      return true;
      break;
    case "null":
      return true;
      break;
    case "undefined":
      return true;
      break;
    default:
      return false;
      break;
  };

  if(typeof _in == "string"){
    if(_in.trim() == ""){
      return true;
    }
  }else if(typeof _in == "undefined"){
    return true;
  };
};*/

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

payaheadDb.prototype.get_organizations = function(response){
  var companies = {};
  users_ref.orderByKey().once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          if(!isNullOrUndefinedOrEmpty(childSnapshot.val()["business_name"])){
            var company = {
              "uid" : childSnapshot.val()["uid"],
              "business_name" : childSnapshot.val()["business_name"],
              "description" : childSnapshot.val()["description"],
              "industry" : childSnapshot.val()["industry"],
              "subaccount_code" : childSnapshot.val()["subaccount_code"]
            }
            companies[childSnapshot.key] = company;
          }
        }
      )
      response.status(200).json(companies);
    },
    function(error) {
      console.log(error);
      response.status(400).json(error);
    }
  );
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

payaheadDb.prototype.get_transactions = function(_uid, response){
  var transactions = {};
  transactions_ref.orderByKey().once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          if(!isNullOrUndefinedOrEmpty(childSnapshot.val()["payerId"]) && childSnapshot.val()["payerId"] == _uid){
            var transaction = childSnapshot.val();
            transactions[childSnapshot.key] = transaction;
          }
        }
      )
      response.status(200).json(transactions);
    },
    function(error) {
      console.log(error);
      response.status(400).json(error);
    }
  );
};

payaheadDb.prototype.get_user = function(uid, _user, authorization, response, request, mDb, isBusiness){
  _db.ref("users/" + uid).once("value", function(data) {
      if (data || JSON.parse(JSON.stringify(data))) {
        var dt = JSON.parse(JSON.stringify(data));

        if(!isNullOrUndefinedOrEmpty(_user)){
          if(isBusiness && isNullOrUndefinedOrEmpty(dt["subaccount_code"])){
            var url = request.protocol + "://" + request.headers['x-forwarded-host'];
            response.status(200).json( { "redirect" : url + '/landing.html?secret=' + authorization + "&id=" + uid + "&business_name=" + dt["business_name"] + "&agreement=" + dt["percentage_charge"] } );
          }else{
            Object.keys(_user).forEach(function(key) {
              dt[key] = _user[key];
            });
            mDb.set_user(dt, response);
            response.status(200).json({"authorization" : authorization, "user" : dt });
          }
        }else{
          if(isBusiness && isNullOrUndefinedOrEmpty(dt["subaccount_code"])){
            var url = request.protocol + "://" + request.headers['x-forwarded-host'];
            response.status(200).json( { "redirect" : url + '/landing.html?secret=' + authorization + "&id=" + uid + "&business_name=" + dt["business_name"] + "&agreement=" + dt["percentage_charge"] } );
          }else{
            response.status(200).json({"authorization" : authorization, "user" : dt });
          }
        }
        
      } else {
        console.log(error);
        response.status(400).json(error);
      }
  });
};

payaheadDb.prototype.get_company_users = function(email, response){
  var domain = email.split('@')[1];
  var users = {};
  users_ref.orderByKey().once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          if(childSnapshot.val()["email"].endsWith(domain)){
            var user = {
              "uid" : childSnapshot.val()["uid"],
              "displayName" : childSnapshot.val()["displayName"],
              "email" : childSnapshot.val()["email"],
              "phoneNumber" : childSnapshot.val()["phoneNumber"],
              "industry" : childSnapshot.val()["industry"],
              "activities" : childSnapshot.val()["activities"]
            }
            users[childSnapshot.key] = user;
          }
        }
      )
      response.status(200).json(users);
    },
    function(error) {
      console.log(error);
      response.status(400).json(error);
    }
  );
};

payaheadDb.prototype.get_users = function(response){
  var users = {};
  users_ref.orderByKey().once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          var user = {
              "uid" : childSnapshot.val()["uid"],
              "displayName" : childSnapshot.val()["displayName"],
              "email" : childSnapshot.val()["email"],
              "phoneNumber" : childSnapshot.val()["phoneNumber"],
              "industry" : childSnapshot.val()["industry"],
              "activities" : childSnapshot.val()["activities"]
            }
            users[childSnapshot.key] = user;
        }
      )
      response.status(200).json(users);
    },
    function(error) {
      console.log(error);
      response.status(400).json(error);
    }
  );
};

payaheadDb.prototype.save_businessuser_details = function(uid, _in, response, mDb){
  
  _db.ref("users/" + uid).once("value", function(data) {
      if (data) {
        var data = JSON.parse(JSON.stringify(data));
        Object.keys(data).forEach(function(key) {
          _in[key] = data[key];
        });
        _db.ref("users/" + _in["uid"]).set(
          _in
          , function(error) {
              if (error) {
                console.log(error);
                response.status(400).json(error);
              } else {
                mDb.write_activity( {"epoch": `${Date.now()}`, "uid": uid, "description": "Completed a business account with PayAhead" }, response);
                response.status(200).json({});
                //response.status(200).json(uj);
              }
          });

      } else {
        console.log(error);
        response.status(400).json(error);
      }
  });
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

payaheadDb.prototype.save_tranactions = function(uid, _details, response, mDb){
  _db.ref("transactions/" + _details["payerId"]).set(
    _details
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
          response.end();
        } else {
          response.status(200).json(_details);
        }
    });

  _db.ref("users/" + uid + "/transactions/" + _details["epoch"]).set(
    _details
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
          response.end();
        } else {
          //response.status(200).json(_details);
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

payaheadDb.prototype.set_user = function(uj, response) {
  _db.ref("users/" + uj["uid"]).set(
    uj
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {
          response.status(200).json({});
        }
    });
};

payaheadDb.prototype.shareApp = function(idb) {
  _db = idb;
  industry_ref = _db.ref('/industry/');
  paystack_keys_ref = _db.ref('/paystack/keys/');
  users_ref = _db.ref('/users/');
  transactions_ref = _db.ref('/transactions/');
};

payaheadDb.prototype.write_activity = function(_details, response){
  _details["id"] = '' + Math.floor((Math.random() * 1111111111) + 1);
  _db.ref("users/" + _details["uid"] + "/activities/" + _details["epoch"]).set(
    _details
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {
          //response.status(200).json(_details);
        }
    });
};

module.exports = payaheadDb;