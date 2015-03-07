var express   = require('express');
var log       = require('./logger');
var conf      = require('./config');


var app = express();

// static file serving
app.use(express.static('public'));

app.get('/philosophy/*', function(req, res, next){
  res.setHeader('content-type', 'application/json');
  next();
  },
  require('./findPhilosophy')()
);

app.on('error', function(exc){
  log.error(exc);
});
app.on('uncaughtException', function(exc){
  log.error(exc);
});
app.listen( conf.port, function() {
  log.info('The server is running on ' + conf.port);
});
