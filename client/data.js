var db = require("mongojs").connect("localhost:27017/silentauction", ["users", "items", 'bids']);
var moment = require("./bower_components/momentjs/moment.js");
var _ = require('./bower_components/underscore/underscore.js');

exports.getUsers = function(f) {
  db.users.find(function(err, users) {
    if (!err && users) {
      f(users);
    }
  });
};

exports.getUserByUserName = function(username, f) {
  db.users.find({userName: username}, function(err, users) {
    if (err) {
      f({errors: err, result: false});
    }
    else if (users && users.length > 0) {
      f({errors: [], result: true, user: users[0]});
    }
    else {
      f({errors: ['no user found'], result: false});
    }
  });
}

exports.getUser = function(username, password, f) {
  db.users.find({userName: username, password: password}, function(err, users) {
    if (err) {
      f({errors: err, result: false});
    }
    else if (users && users.length > 0) {
      f({errors: [], result: true, user: users[0]});
    }
    else {
      f({errors: ['no user found'], result: false});
    }
  });
};

exports.saveUser = function(user, f, update) {
  var saveCallback = function(errors, user) {

    if (errors && errors.length > 0) {
      f({result:false, errors: errors});
      return;
    }

    f([], true);
    return;
  };

  db.users.find({userName: user.userName}, function(err, users) {

    if (err) {
      f({errors: err, result: false});
      return;
    }

    if (users && users.length > 0 && !update) {
      f({errors: ['user name already exists'], result: false});
      return;
    }

    db.users.save(user, saveCallback);
  });
};

exports.saveImage = function(itemId, imageName, f){
  var item = exports.getItem(itemId, function(item) {
    if (!item.images) {
      item.images = [];
    }

    item.images.push(imageName);

    exports.saveItem(item, function() {
      f();
    })
  })
}

exports.createObjectId = function(id){
  return db.ObjectId(id);
}

exports.saveItem = function(item, f) {

  var saveCallback = function(errors, item) {
    if (errors && errors.length > 0) {
      f({errors: errors});
    }

    if (!item) {
      f({errors: ['no item object returned'], id: ''});
      return;
    }

    f({errors: [], id: item._id});
  };

  db.items.save(item, saveCallback);
};

exports.saveBid = function(bid, f) {
  var getCallback = function(l) {
    if (new Date() > l.EndDateTime) {
      f({errors: ['Sorry! Your generous bid has been rejected by the harsh realities of time. (auction is closed)']});
      return;
    }

    if (bid.Amount < +l.MinimumBid) {
      f({errors: ['bid must be more than the minimum bid.']});
      return;
    }

    for(var i=0; i<l.Bids.length; i++) {
      if (l.Bids[i].Amount + 1 > bid.Amount) {
        f({errors: ['bid must be at least one dollar more than the current high bid.']});
        return;
      }
    }

    if (!l.Bids) l.Bids = [];
    l.Bids.push(bid);
    exports.saveLot(l, f);
  };
  exports.getDetails(getCallback, bid.LotId);
};

exports.deleteLots = function() {
  var deleteCallback = function(lots) {
    for(var i = lots.length - 1; i >= 0; i--)
    {
      db.lots.remove(lots[i]);
    }
  };

  exports.getOpenLots(deleteCallback);
};

exports.getTotalBids = function(f) {
  exports.getClosedLots(function(lots){
    var total = 0;
    for(var i=0; i<lots.length; i++) {
      if (lots[i].Bids && lots[i].Bids.length > 0)
        total = total + +lots[i].Bids[lots[i].Bids.length - 1].Amount;
    }
    f(total);
  });
};

exports.getTotalRaised = function(f) {

  var map = function () {
    var x = { bids : this.bids , _id : this._id };
    var max = 0;

    if (this.bids) {
      for(var i=0; i<this.bids.length; i++){
        if (this.bids[i].amount > max) {
          max = this.bids[i].amount;
        }
      }
    }
    emit(this._id, { maxBid : max } )
  }

  var reduce = function (key, values) {
    var res = values[0];
    for ( var i=1; i<values.length; i++ ) {
      res.maxBid += values[i].maxBid;
    }
    return res;
  }

  db.items.mapReduce(map, reduce, { out : { inline : false } }, function(errors, data){
    var total = 0;
    if (!data || data.length == 0){
      return f(0);
    }
    for(var i=0; i<data.length; i++){
      total += data[i].value.maxBid;
    }

    f(total);
  });
}

exports.getDashboardData = function(username, f) {

  db.items.find( function(err, items){
    var data = [];

    _.each(items, function(item){
      if (_.find(item.bids, function(bid){return (bid.userName == username);})) {
        data.push({item: item, bid: {}});
      }
    })

    _.each(data, function(d){
      var userHighBid = 0;
      var highBid = 0;

      _.each(d.item.bids, function(bid){
        if (bid.amount > highBid){
          highBid = bid.amount;
        }

        if (bid.amount > userHighBid && bid.userName == username) {
          userHighBid = bid.amount;
        }
      })

      d.bid.highBid = highBid;
      d.bid.userHighBid = userHighBid;
    })

    f(data);
  })
//
//  var data = [{
//        item: {Id: 1, Title: 'Test Item', ClosedDate: '2014-01-01', Closed: false},
//        bid: {highBid: 20, userHighBid: 18, bidStatus: 'losing'}
//      },
//      {
//        item: {Id: 2, Title: 'Test Item 2', ClosedDate: '2014-01-01', Closed: false},
//        bid: {highBid: 20, userHighBid: 18, bidStatus: 'losing'}
//      }
//    ];
//
//  f(data);

}


exports.getOpenItems = function(f) {
  var m = new moment();
  db.items.find({EndDate: { $gt: m.utc().format('YYYY-MM-DDTHH:mm:ss') }}, function(err, items) {
    if (!err && items) {
      f(items);
    }
  });
};

exports.getAllItems = function(f) {
  db.items.find(function(err, items) {
    if (!err && items) {
      f(items);
    }
  });
};


exports.getClosedLots = function(f) {
  var d = new moment();
  db.items.find({EndDate: { $lt: d.utc().format('YYYY-MM-DDTHH:mm:ss') }}, function(err, items) {
    if (!err && items) {
      f(items);
    }
  });
};

exports.getItem = function(id, f) {
  db.items.find({_id: db.ObjectId(id)}, function(err, lot) {

    if (!err && lot) {
      if (lot.length > 0) f(lot[0]);
    } else {
      console.log(err);
    }

  });
};
