var http = require('http');
var express = require('express');
var connect = require('connect');
var querystring = require('querystring');

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


var _getOptions = function(path, method, token, postData) {
  var options = {
    host: 'localhost',
    path: path,
    port: '8887',
    headers: {},
    method: method
  };

  if (method.toLowerCase() == 'post'){
    options.headers = {'Content-Type': 'application/x-www-form-urlencoded',
                      'Content-Length': postData.length,
                      'Authorization': token};
  } else {
    options.headers = {'Authorization': token};
  }

  return options;
};


var _sendRequest = function(options, f){
  http.request(options, function(data){
    var str = '';
    data.on('data', function (chunk) {
      str += chunk;
    });

    data.on('end', function () {
      f(str);
    });

  }).end();
};


var _postRequest = function(options, f, postData){
  var post = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
    });
    res.on('end', function(d) {
      f(d);
    })
  });
  post.write(postData);
  post.end();
};

app.get('/api/items', function(req, res) {
  var options = _getOptions('/api/items', 'GET', req.headers.authorization);
  _sendRequest(options, function(data){res.send(data);});
});

app.get('/api/item/:id', function(req, res){
  console.log('id = ' + req.params.id)
  var options = _getOptions('/api/item/' + req.params.id, 'GET', req.headers.authorization);
  _sendRequest(options, function(data){res.send(data);});
})

app.post('/api/bid', function(req, res) {
  var bid = querystring.stringify(req.body);

  var options = _getOptions('/api/bid', 'POST', req.headers.authorization, bid);
  _postRequest(options, function(data){res.send(data);}, bid);
});


http.createServer(app).listen(8889, function() {
  console.log('web server listening on port 8889');
});



