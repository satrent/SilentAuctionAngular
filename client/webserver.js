var http = require('http');
var express = require('express');
var connect = require('connect');

var app = express();

app.use("/", express.static(__dirname + '/pages'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/partials', express.static(__dirname + '/partials'));


app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.bodyParser());


var _getOptions = function(path, method, token) {
  return {
    host: 'localhost',
    path: path,
    port: '8887',
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: {'Authorization': token},
    method: method
  };
};

app.get('/api/items', function(req, res) {
  var options = _getOptions('/api/items', 'GET', req.headers.authorization);

  http.request(options, function(data){
    var str = '';
    data.on('data', function (chunk) {
      str += chunk;
    });

    data.on('end', function () {
      res.send(str);
    });

  }).end();
});

http.createServer(app).listen(8889, function() {
  console.log('web server listening on port 8889');
});



