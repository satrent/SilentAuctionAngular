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


var _connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'silentauction',
  database : 'SilentAuction',
  password : '11x6jcyKc08'
});

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

  user.password = crypto.createHash('md5').update(user.password).digest('hex');

  if (!user.activatedOn) {
    user.activatedOn = new Date();
  }

  db.saveUser(user, function() {
    res.json({message: '', result: true});
  })
})

_connection.config.queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};

app.get('/api/items', function(req, res) {
  db.getOpenItems(function(items){
    res.send(JSON.stringify(items));
  })
});

app.post('/images', function(req, res){
  var tempPath = req.files.file.path;
  var ext = tempPath.substring(tempPath.lastIndexOf('.', tempPath) + 1, tempPath.length);
  var filename = Math.round(Math.random() * 10000000000) + '.' + ext;
  var targetPath = path.resolve('./images/' + filename);

  console.log(filename);
  fs.rename(tempPath, targetPath, function(err) {
    if (err) throw err;

    // save the image name to the database.
    db.saveImage(req.body.itemId, filename, function() {
      res.send("image saved");
    });
  });
})

var _formatDate = function(d){
  d = d.replace(/T/, ' ').
        replace(/\..+/, '');  // replace everything after the dot.

  return mysql.escape(d);
}

app.get('/api/item/:id', function(req, res) {
  db.getItem(req.params.id, function(item){
    console.log(item);
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

  _connection.query("select max(amount) as highBid from Bids where itemId = :itemId", bid, function(err, rows) {

    if (rows.length > 0 && ((rows[0].highBid + 1) > bid.amount)) {
      res.send(JSON.stringify({result: false, message: 'Bid must be at least one dollar moe than the current high bid, ' + rows[0].highBid + '.'}));
      return;
    }

    // save the bid to the database.
    _connection.query("insert into Bids (itemId, Amount, UserName, CreatedDate) values (:itemId, :amount, :userName, now())", bid, function(err) {
      if (err == null) {
        res.send(JSON.stringify({result: true, message: 'Bid received.'}));
      } else {
        console.log(err);
        res.send(JSON.stringify({result: false, message: 'there was a problem with the bid.' }));
      }
    });
  });
});

http.createServer(app).listen(8889, function() {
  console.log('web server listening on port 8889');
});



