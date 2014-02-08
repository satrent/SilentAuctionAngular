var http = require('http');
var express = require('express');
var mysql = require('mysql');
var jwtAuth = require('express-jwt');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');


var app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.bodyParser());


app.configure(function(){
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
    return next();
  });
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.use('/api', jwtAuth({secret: 'fk139d0sl30sl'}));


var _connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'silentauction',
  database : 'SilentAuction',
  password : '11x6jcyKc08'
});

app.options('/authenticate', function(req, res){
    res.send('');
});

app.post('/authenticate', function (req, res) {
    //TODO - hash the password on the client.
    //if is invalid, return 401

    var password = crypto.createHash('md5').update(req.body.password).digest('hex');

    _connection.query('Select * from Users where UserName= :userName and password = :password', {userName: req.body.userName, password: password}, function(err, rows, fields) {

        console.log(rows);

        if (rows.length != 1){
            res.send(401, 'Wrong user or password');
            return;
        }

        var profile = {
            userId: rows[0].Id,
            userName: rows[0].UserName ,
            isAdmin: rows[0].IsAdmin,
            email: rows[0].Email
        };

        // We are sending the profile inside the token
        var token = jwt.sign(profile, 'fk139d0sl30sl');

        res.json({ token: token });

    });

});


_connection.config.queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};

app.options('/api/items', function(req, res) {
    res.send('');
})

app.get('/api/items', function(req, res) {
  _connection.query('SELECT * from Items', function(err, rows, fields) {
    if (err) throw err;
    res.send(JSON.stringify(rows));
  });

});

app.get('/api/item/:id', function(req, res) {
  _connection.query('Select * from Items where Id= :Id', {'Id': req.params.id}, function(err, rows, fields) {
    if (err || rows.length != 1) throw err;

    res.send(JSON.stringify(rows[0]));
  });
});

app.options('/api/item', function(req, res){
  res.send('');
});

app.post('/api/item', function(req, res){
  var item = req.body;

  if (item.Id > 0)
  {
    _connection.query("UPDATE items SET title = :Title, Description = :Description, DonatedBy = :DonatedBy, DonatedLink = :DonatedLink where id = :Id", item, function(err){
      console.log(err);
    });
  } else {
    _connection.query("insert into items (Title, description, startdate, enddate, DonatedBy, DonatedLink) values(:Title, :Description, :StartDate, :EndDate, :DonatedBy, :DonatedLink)", item, function(err){
      console.log(err);
    });
  }

  res.send({message: 'all good', result: true});
});

app.options('/api/bid', function(req, res){
    res.send('');
});

app.post('/api/bid', function(req, res) {
   var bid = req.body;

   //TODO - check that the bid is at least one dollar more than the current high bid.


   // save the bid to the database.
   _connection.query("insert into Bids (itemId, Amount, UserName, CreatedDate) values (:ItemId, :Amount, :UserName, now())", bid, function(err) {
      console.log(err);
   });
});





http.createServer(app).listen(8887, function() {
  console.log('server listening on 8887.');
});


