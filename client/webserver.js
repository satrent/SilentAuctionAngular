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
var gm = require('gm').subClass({ imageMagick: true });
var nodemailer = require("nodemailer");

var app = express();
app.use(express.multipart());

app.use("/", express.static(__dirname + '/pages'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/partials', express.static(__dirname + '/partials'));
app.use('/templates', express.static(__dirname + '/templates'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.bodyParser({uploadDir:'./images'}));
app.use('/api', jwtAuth({secret: 'fk139d0sl30sl'}));


app.post('/authenticate', function (req, res) {
  //TODO - hash the password on the client.
  //if is invalid, return 401

  var password = crypto.createHash('md5').update(req.body.password).digest('hex');

  db.getUser(req.body.userName, password, function(result){
    if (result.result) {
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


app.post('/register', function(req, res) {

  var user = req.body.user;
	var userEmail = user.email;

  user.password = crypto.createHash('md5').update(user.password).digest('hex');

  if (!user.activatedOn) {
    user.activatedOn = new Date();
  }

  db.saveUser(user, function() {
    res.json({message: '', result: true});
  })
  // create reusable transport method (opens pool of SMTP connections)
  var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
          user: "",
          pass: ""
    	}
  });



  // setup e-mail data with unicode symbols
  var mailOptions = {
  from: "", // sender address
  to: userEmail, // list of receivers
  subject: "Silent Auction - Registration", // Subject line
  text: "Thanks for the registration, bro.", // plaintext body
  html: "" // html body
  }

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
  if(error){
      console.log(error);
  }else{
      console.log("Message sent: " + response.message);
  }
			
  // if you don't want to use this transport object anymore, uncomment following line
  //smtpTransport.close(); // shut down the connection pool, no more messages
  });
})

app.get('/api/items', function(req, res) {
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
    res.send(data);
  })

})

app.post('/images', function(req, res){
  var tempPath = req.files.file.path;
  var ext = tempPath.substring(tempPath.lastIndexOf('.', tempPath) + 1, tempPath.length);
  var filename = Math.round(Math.random() * 10000000000) + '.' + ext;
  var targetPath = path.resolve('./images/' + filename);

  //presave image resize
  gm(tempPath)
  .resize(300,300)
  .write(tempPath, function (err) {
    if (!err) {
        console.log('done');
    } else {
        console.log(err)};

    console.log(filename);
    fs.rename(tempPath, targetPath, function(err) {
      if (err) throw err;

      // save the image name to the database.
      db.saveImage(req.body.itemId, filename, function() {
        res.send("image saved");


      gm(targetPath)
      .resize(300, 300)
      .write(targetPath, function (err) {
        if (!err) console.log('done');
      });

      });
    });
  })
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

    if (item.bids <= item.MinimumBid) {
			res.send(JSON.stringify({result: false, message: 'Bid amount must be greater than the minimum bid amount.'}));
			return;
		}

    if (item.bids.length > 0 && (item.bids[item.bids.length - 1].amount + 1) > bid.amount) {
      res.send(JSON.stringify({result: false, message: 'Bid amount must be at least one dollar more than the current high bid.'}));
      return;
    }
    if (item.bids <= item.MinimumBid) {
      res.send(JSON.stringify({result: false, message: 'Bid amount must be greater than the minimum bid amount.'}));
        return;
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

http.createServer(app).listen(8889, function() {
  console.log('web server listening on port 8889');
});
