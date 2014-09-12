var http = require('http');
var express = require('express');
var querystring = require('querystring');
var fs = require('fs');
var path = require('path');
var db = require('./data.js');
var mysql = require('mysql');
var jwtAuth = require('express-jwt');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var moment = require("./bower_components/momentjs/moment.js");
var gm = require('gm');
var nodemailer = require("nodemailer");
var _ = require("./bower_components/underscore/underscore.js");

var app = express();
app.use(express.multipart());

app.use("/", express.static(__dirname + '/pages'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/outbid', express.static(__dirname + '/outbid'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/partials', express.static(__dirname + '/partials'));
app.use('/templates', express.static(__dirname + '/templates'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.bodyParser({uploadDir:'./images'}));
app.use('/api', jwtAuth({secret: 'fk139d0sl30sl'}));


var appSettings = {};
var emailSettings = {};

fs.readFile('app-settings.json', 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }

  appSettings = JSON.parse(data);
});

fs.readFile('email-config.json', 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }

  emailSettings = JSON.parse(data);
});

var isAdmin = function(userName){
  return _.contains(appSettings.admins, userName);
};

app.get("/domain", function(req, res){
  res.json({'domain': appSettings.domain});
})

app.post('/authenticate', function (req, res) {
  //TODO - hash the password on the client.
  //if is invalid, return 401

  var password = crypto.createHash('md5').update(req.body.password).digest('hex');

  db.getUser(req.body.userName, password, function(result){
    if (result.result && result.user.isActive) {
      var profile = {
        userName: result.user.userName ,
        isAdmin: result.user.IsAdmin,
        email: result.user.email
      };

      var token = jwt.sign(profile, 'fk139d0sl30sl');
      res.json({ token: token });

    } else {
      res.send(401, 'User/password not found.');
    }
  })
});

app.post('/activate', function(req, res) {
  var user = req.body.user;


  db.getUserByUserName(user.userName, function(result){
    if (result && result.result && result.user && result.user.activationKey == user.activationKey){

      result.user.activatedOn = new Date();
      result.user.isActive = true;

      db.saveUser(result.user, function(errors, result){
        res.json({messages: '', result: true});
      }, true);

    } else {
      res.json({messages: 'user could not be found', result: false});
    }
  })
});

var sendEmail = function(args) {
  var file =  'email-config.json';

  var smtpTransport = nodemailer.createTransport("SMTP", emailSettings);

  var mailOptions = {
    from: "silentauction@porticobenefits.org",
    to: args.to,
    subject: args.subject, // Subject line
    text: args.plainText,
    html: args.htmlText
  }

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
    }

    smtpTransport.close(); // shut down the connection pool, no more messages
  });
}

app.post('/register', function(req, res) {

  var user = req.body.user;
  var userEmail = user.email;

  user.isActive = false;
  user.password = crypto.createHash('md5').update(user.password).digest('hex');
  user.activationKey = parseInt(Math.random() * 1000000000);

  db.saveUser(user, function(errors, result) {

    if (!result) {
      res.json({messages: errors, result: false});
      return;
    } else {

      sendEmail({
        to: userEmail,
        subject:'Silent Auction - Registration',
        plainText: 'Please click to activate your account. ' + appSettings.siteUrl + '/#/activate',
        htmlText: "Please <a href='" + appSettings.siteUrl + "/#/activate?username="+user.userName+"&key=" + user.activationKey + "'>click</a> to activate your account."
      });

      res.json({messages: [], result: true});
    }
  })
});

app.get('/api/items', function(req, res) {

  console.log('user name...');
  console.log(req.user);

  var f = function(items){
    res.send(JSON.stringify(items));
  }
  db.getOpenItems(f);
});

app.get('/api/items/all', function(req, res){
  db.getAllItems(function(items){
    res.send(JSON.stringify(items));
  })
});

app.get('/api/myBids/:username', function(req, res){

  db.getDashboardData(req.params.username, function(data){

    _.each(data, function(d){
      d.bid.bidStatus = '';
      var now = new moment();
      var enddate = new moment(d.item.EndDate);


      if (enddate > now && d.bid.userHighBid == d.bid.highBid){
        d.bid.bidStatus = 'winning';
      }
      if (enddate > now && d.bid.userHighBid < d.bid.highBid){
        d.bid.bidStatus = 'losing';
      }
      if (enddate <= now && d.bid.userHighBid == d.bid.highBid){
        d.bid.bidStatus = 'won';
      }
      if (enddate <= now && d.bid.userHighBid < d.bid.highBid){
        d.bid.bidStatus = 'lost';
      }

    })

    res.send(data);
  })

})

app.post('/api/images', function(req, res){

  try {
    if (!isAdmin(req.user.userName)){
      res.send(401, 'not authorized');
      return;
    }

    var tempPath = req.files.file.path;
    var ext = tempPath.substring(tempPath.lastIndexOf('.', tempPath) + 1, tempPath.length);
    var filename = Math.round(Math.random() * 10000000000) + '.' + ext;
    console.log('file name is ' + filename); var targetPath = path.resolve(__dirname + '/images/' + filename);
    var thumbnailPath = path.resolve(__dirname + '/images/thumbnails/' + filename);

    console.log(filename);


    gm(tempPath)
      .resize(300,300)
      .write(targetPath, function (err) {

        console.log('inside the callback');
        console.log(err);
        console.log('_________');

        if (!err) {
          console.log('done');
        } else {
          console.log(err)
        }

        gm(tempPath)
          .resize(180,180)
          .write(thumbnailPath, function(err) {
            if(!err) {
              console.log('done');
            } else {
              console.log(err);
            }

            db.saveImage(req.body.itemId, filename, function() {
              res.send("image saved");
            });
          });
      })
  }
  catch (exception){
    console.log(exception);
  }
});

var _formatDate = function(d){
  d = d.replace(/T/, ' ').
        replace(/\..+/, '');  // replace everything after the dot.

  return mysql.escape(d);
}

app.get('/api/item/:id', function(req, res) {
  db.getItem(req.params.id, function(item){
    res.send(JSON.stringify(item));
  });
});

app.post('/api/item', function(req, res){

  if (!isAdmin(req.user.userName)){
    res.send(401, 'not authorized');
    return;
  }

  var item = req.body;

  item._id = db.createObjectId(item._id);

  db.saveItem(item, function(errors, item){
    res.send(JSON.stringify({message: 'all good', result: true}));
  });

});

app.post('/api/bid', function(req, res) {
  var bid = req.body;

  db.getItem(bid.itemId, function(item){
    if (!item.bids){
      item.bids = [];
    }

    if (bid.amount <= item.MinimumBid) {
			res.send(JSON.stringify({result: false, message: 'Bid amount must be greater than the minimum bid amount.'}));
			return;
		}

    if (item.bids.length > 0 && (item.bids[item.bids.length - 1].amount + 1) > bid.amount) {
      res.send(JSON.stringify({result: false, message: 'Bid amount must be at least one dollar more than the current high bid.'}));
      return;
    }
    
    var currentTime = new moment().format("YYYY-MM-DD hh:mm:ss");
    if (currentTime > moment(item.EndDate).format("YYYY-MM-DD hh:mm:ss")){
      res.send(JSON.stringify({result: false, message: 'Bid too late! This item\'s bidding time is up.'}));
      return;
    }

    // send an email to the previous high bidder.
    if (item.bids.length > 0 && item.bids[item.bids.length - 1].userName != bid.userName) {
      var randomImage = parseInt(Math.random() * 20) + 1;

      db.getUserByUserName(item.bids[item.bids.length - 1].userName, function(result){
        sendEmail({
          to: result.user.email,
          subject:"You've been outbid! - Silent Auction",
          plainText: "oh no! you've been outbid",
          htmlText: "<div><img src='" + appSettings.siteUrl + "/outbid/" + randomImage + ".jpg'></div>You've been outbid! Click <a href='" + appSettings.siteUrl + "/#/item/"+item._id+"'>here</a> to fix it."
        });
      });
    }

    item.bids.push({itemId: bid.itemId, userName: bid.userName, amount: bid.amount, bidDate: new moment().format("YYYY-MM-DD hh:mm:ss") });

    db.saveItem(item, function(errors, item) {
      res.send(JSON.stringify({result: true, message: 'Bid received.'}));
      return;
    })
  })
});

app.get("/api/items/totalRaised", function(req, res){
  db.getTotalRaised(function(total){
    res.send({total: total});
  })
})

app.get("/api/closed", function(req, res){
  db.getClosedLots(function(items){
    res.send(JSON.stringify(items));
  })
});

app.get("/api/upcoming", function(req, res){
  db.getUpcomingLots(function(items){
    res.send(JSON.stringify(items));
  })
});

http.createServer(app).listen(8889, function() {
  console.log('web server listening on port 8889');
});
