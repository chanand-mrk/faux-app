var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();

//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({
  secret: 'Zmx1ZmZ5IGJ1bm55IHNsaXBwZXJz',
  cookie: {
    path: '/',
    maxAge: 3600000
  }
}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//HTML Routes
app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/authcode', routes.authcode);
app.get('/resource', routes.resource);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
