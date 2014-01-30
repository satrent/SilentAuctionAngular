
var connect = require('connect'),
    http = require('http');

connect()
    .use(connect.static(__dirname))
    .listen(8889);

console.log('web server listening on port 8889');