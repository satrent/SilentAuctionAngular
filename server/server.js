var http = require('http');
var express = require('express');
var mysql = require('mysql');
var app = express();

app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.bodyParser());

app.configure(function(){
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    return next();
  });
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


var _connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'silentauction',
  database : 'SilentAuction',
  password : '11x6jcyKc08'
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
  res.send('all good');
});

app.post('/api/item', function(req, res){
  var item = req.body;
  console.log(item);

  _connection.query("UPDATE items SET title = :Title, Description = :Description, DonatedBy = :DonatedBy, DonatedLink = :DonatedLink where id = :Id", item, function(err){
    console.log(err);
  });

  res.send('all good');
});


http.createServer(app).listen(8887, function() {
  console.log('server listening on 8887.');
});


