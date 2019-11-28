var _db;
var industry_ref, paystack_keys_ref, transactions_ref;
var users_ref;
var isNullOrUndefinedOrEmpty = function(){};

function payaheadDb() {
  isNullOrUndefinedOrEmpty = function(_in){
    var _check = _in+"";
      switch(_check){
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
        case "{}":
          return true;
          break;
        case {}:
          return true;
          break;
        case "[]":
          return true;
          break;
        case []:
          return true;
          break;
        default:
          if(typeof _check == "string"){
          if(_check.trim() == "" || _check.split(" ").join("") == ""){
            return true;
          }else{
            return false;
          }
        }else if(typeof _check == "undefined"){
          return true;
        }
          break;
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
  _db.ref("transactions/" + _uid).once('value').then(
    function(snapshot) {
      snapshot.forEach(
        function(childSnapshot) {
          var transaction = childSnapshot.val();
          transactions[childSnapshot.key] = transaction;
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

        /*_db.ref("transactions/" + dt["addedBy"]).once("value", function(trans){
          var trans = JSON.parse(JSON.stringify(trans));
          _db.ref("users/" + uid + "/transactions").set(
            trans
            , function(error) {
                if (error) {
                  console.log(error);
                  response.status(400).json(error);
                } else {
                  //response.status(200).json({});
                }
            });
        });*/

        if(!isNullOrUndefinedOrEmpty(_user)){
          if(isBusiness && isNullOrUndefinedOrEmpty(dt["subaccount_code"])){
            var url = request.protocol + "://" + request.headers['x-forwarded-host'];
            response.status(200).json( { "redirect" : url + '/landing.html?secret=' + authorization + "&id=" + uid + "&business_name=" + dt["business_name"] + "&agreement=" + dt["percentage_charge"] + "&business_mobile=" + dt["phoneNumber"] } );
          }else{
            Object.keys(_user).forEach(function(key) {
              dt[key] = _user[key];
            });
            dt["customClaims"] = null;
            mDb.set_user(dt, response);
            response.status(200).json({"authorization" : authorization, "user" : dt });
          }
        }else{
          if(isBusiness && isNullOrUndefinedOrEmpty(dt["subaccount_code"])){
            var url = request.protocol + "://" + request.headers['x-forwarded-host'];
            response.status(200).json( { "redirect" : url + '/landing.html?secret=' + authorization + "&id=" + uid + "&business_name=" + dt["business_name"] + "&agreement=" + dt["percentage_charge"] + "&business_mobile=" + dt["phoneNumber"] } );
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
            /*var user = {
              "uid" : childSnapshot.val()["uid"],
              "displayName" : childSnapshot.val()["displayName"],
              "email" : childSnapshot.val()["email"],
              "phoneNumber" : childSnapshot.val()["phoneNumber"],
              "photoURL" : childSnapshot.val()["photoURL"],
              "industry" : childSnapshot.val()["industry"],
              "activities" : childSnapshot.val()["activities"],
              "transactions" : childSnapshot.val()["transactions"],
              "addedBy" : childSnapshot.val()["addedBy"],
              "bvn" : childSnapshot.val()["bvn"],
              "branch" : childSnapshot.val()["branch"],
              "disabled" : childSnapshot.val()["disabled"],
              "isBusiness" : childSnapshot.val()["isBusiness"],
              "isStaff" : childSnapshot.val()["isStaff"],
              "business_name" : childSnapshot.val()["business_name"],
              "description" : childSnapshot.val()["description"],
              "industry" : childSnapshot.val()["industry"],
              "subaccount_code" : childSnapshot.val()["subaccount_code"]
            }*/
            users[childSnapshot.key] = childSnapshot.val();
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
            users[childSnapshot.key] = childSnapshot.val();
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
        _in['subaccount_code'] = { 'id' : _in['subaccount_id'] };
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

payaheadDb.prototype.save_transaction = function(uid, _details, response, mDb){
  
  // root / Users / Payer ID / Transactions / Epoch-Paid
  _details["seen"] = true;
  _db.ref("users/" + uid + "/transactions/" + _details["epochPayed"]).set(
    _details
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {

          // root / Users / Payee ID / Transactions / Epoch-Paid
          _details["seen"] = false;
            _db.ref("users/" + _details["payeeId"] + "/transactions/" + _details["epochPayed"]).set(
              _details
              , function(error) {
                  if (error) {
                    console.log(error);
                    response.status(400).json(error);
                  } else {

                    // root / Transactions (root) / Payer ID / Epoch-Paid
                    _details["seen"] = true;
                   _db.ref("transactions/" + _details["payerId"] + "/" + _details["epochPayed"]).set(
                      _details
                      , function(error) {
                          if (error) {
                            console.log(error);
                          } else {

                            // root / Transactions (root) / Payee ID / Epoch-Paid
                            _details["seen"] = false;
                            _db.ref("transactions/" + _details["payeeId"] + "/" + _details["epochPayed"]).set(
                              _details
                              , function(error) {
                                  if (error) {
                                    console.log(error);
                                    response.status(400).json(error);
                                  } else {

                                    // root / Users / Staff ID / Transactions / Epoch-Paid
                                    /*var usrs = [];
                                    users_ref.orderByKey().once('value').then(
                                      function(snapshot) {
                                        snapshot.forEach(
                                          function(childSnapshot) {
                                              if(childSnapshot.val()["addedBy"] == _details["payeeId"]){
                                                usrs.push(childSnapshot.key);
                                              }
                                          }
                                        )
                                      },
                                      function(error) { console.log(error); }
                                    );
                                    for(var i = 0; i < usrs.length; i++){
                                      _db.ref("users/" + usrs[i] + "/transactions/" + _details["epochPayed"]).set(
                                        _details
                                        , function(error) {
                                            if (error) {
                                              console.log(error);
                                            } else {
                                              //Successful
                                            }
                                        });
                                    }*/
                                    //

                                    try{
                                      mDb.write_activity( {"epoch": _details["epochPayed"], "uid": uid, "description": "Payed NGN " +  (parseInt(_details["amount"]) / 100) + " to " + _details["payee"]}, response);
                                    }catch(e){ console.log(e)};
                                    response.status(200).json(_details);
                                    

                                  }
                              });
                            //

                          }
                      });
                   //

                  }
              });
          //


          

        }
    });
  //
};

payaheadDb.prototype.save_conversation = function(uid, _details, response, mDb){

  // root / Users / Sender ID / Conversations / Reciever ID / Epoch-Sent
  _details["seen"] = true;
  _db.ref("users/" + uid + "/conversations/" + _details["recieverId"] + "/" + _details["epochSent"]).set(
    _details
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {

          // root / Users / Reciever ID / Conversations / Sender ID / Epoch-Sent
          _details["seen"] = false;
            _db.ref("users/" + _details["recieverId"] + "/conversations/" + uid + "/" + _details["epochSent"]).set(
              _details
              , function(error) {
                  if (error) {
                    console.log(error);
                    response.status(400).json(error);
                  } else {

                    // root / Conversations / Sender ID / Epoch-Sent
                    _details["seen"] = true;
                    _db.ref("conversations/" + _details["senderId"] + "/" + _details["epochSent"]).set(
                      _details
                      , function(error) {
                          if (error) {
                            console.log(error);
                            response.status(400).json(error);
                            response.end();
                          } else {

                            // root / Conversations / Reciever ID / Epoch-Sent
                            _details["seen"] = false;
                            _db.ref("conversations/" + _details["recieverId"] + "/" + _details["epochSent"]).set(
                              _details
                              , function(error) {
                                  if (error) {
                                    console.log(error);
                                    response.status(400).json(error);
                                    response.end();
                                  } else {

                                      if(!isNullOrUndefinedOrEmpty(_details["paymentId"])){
                                        _details["condition"] = "refundRequested";
                                        mDb.update_transaction(uid, _details, response, mDb)
                                      }else{
                                        response.status(200).json({});
                                      }

                                  }
                              });
                            //

                          }
                      });
                    //

                  }
              });
            //

        }
    });
  //
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

payaheadDb.prototype.update_transaction = function(uid, _details, response, mDb){

  // root / Users / Payer ID / Transactions / Epoch-Paid 
  if(uid == _details["payerId"]){
    _details["seen"] == true;
  }else{
    _details["seen"] == false;
  }
  _db.ref("users/" + _details["payerId"] + "/transactions/" + _details["epochPayed"]).set(
    _details
    , function(error) {
        if (error) {
          console.log(error);
          response.status(400).json(error);
        } else {

          // root / Users / Payee ID / Transactions / Epoch-Paid 
          if(uid == _details["payeeId"]){
            _details["seen"] == true;
          }else{
            _details["seen"] == false;
          }
          _db.ref("users/" + _details["payeeId"] + "/transactions/" + _details["epochPayed"]).set(
            _details
            , function(error) {
                if (error) {
                  console.log(error);
                  response.status(400).json(error);
                } else {

                   // root / Transactions (root) / Payer ID / Epoch-Paid
                   if(uid == _details["payerId"]){
                    _details["seen"] == true;
                  }else{
                    _details["seen"] == false;
                  }
                   _db.ref("transactions/" + _details["payerId"] + "/" + _details["epochPayed"]).set(
                      _details
                      , function(error) {
                          if (error) {
                            console.log(error);
                          } else {

                            // root / Transactions (root) / Payee ID / Epoch-Paid
                            if(uid == _details["payeeId"]){
                              _details["seen"] == true;
                            }else{
                              _details["seen"] == false;
                            }
                            _db.ref("transactions/" + _details["payeeId"] + "/" + _details["epochPayed"]).set(
                              _details
                              , function(error) {
                                  if (error) {
                                    console.log(error);
                                    response.status(400).json(error);
                                  } else {

                                    switch(_details["condition"]){
                                      case "refunded":
                                      //root / Users / Staff ID / Transactions / Epoch-Paid
                                      if(uid == _details["refunderId"]){
                                        _details["seen"] == true;
                                      }else{
                                        _details["seen"] == false;
                                      }
                                        _db.ref("users/" + _details["refunderId"] + "/transactions/" + _details["epochPayed"]).set(
                                          _details
                                          , function(error) {
                                              if (error) {
                                                console.log(error);
                                              } else {

                                              }
                                            });
                                        //
                                        mDb.write_activity( {"epoch": `${Date.now()}`, "uid": uid, "description": "Refunded payment with id " + _details["reference"] + " on PayAhead" }, response);
                                        break;
                                      case "verified":
                                        //root / Users / Staff ID / Transactions / Epoch-Paid
                                        if(uid == _details["verifierId"]){
                                          _details["seen"] == true;
                                        }else{
                                          _details["seen"] == false;
                                        }
                                        _db.ref("users/" + _details["verifierId"] + "/transactions/" + _details["epochPayed"]).set(
                                          _details
                                          , function(error) {
                                              if (error) {
                                                console.log(error);
                                              } else {

                                              }
                                            });
                                        //
                                        mDb.write_activity( {"epoch": `${Date.now()}`, "uid": uid, "description": "Verified payment with id " + _details["reference"] + " on PayAhead" }, response);
                                        break;
                                      case "refundRequested":
                                        mDb.write_activity( {"epoch": `${Date.now()}`, "uid": uid, "description": "Requested full refund for payment with id " + _details["reference"] + " on PayAhead" }, response);
                                        break;
                                      default:
                                        break;
                                    }
                                    response.status(200).json(_details);

                                  }
                              });
                            //

                          }
                      });
                   //

                }
            });
          //

        }
    });
  //
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