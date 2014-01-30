var http = require('http');
var express = require('express');
var mysql = require('mysql');
var app = express();

app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.bodyParser());


var _connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'silentauction',
  database : 'SilentAuction',
  password : '11x6jcyKc08'
});


app.get('/api/items', function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

  _connection.connect();
  _connection.query('SELECT * from Items', function(err, rows, fields) {
    if (err) throw err;
    res.send(JSON.stringify(rows));
  });

  _connection.end();
});

app.get('/api/item/:id', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  _connection.connect();
  _connection.query('Select * from Items where Id=?', req.params.id, function(err, rows, fields) {
    if (err || rows.length != 1) throw err;

    res.send(JSON.stringify(rows[0]));
  });
});


http.createServer(app).listen(8887, function() {
  console.log('server listening on 8887.');
});


