var http = require('http');
var request = require('request');

var PUBLIC_KEY = 'hAkoAtG7YOS3DY61RsEQ2VXbH5Kk4mNG';
var SECRET_KEY = 'kRyuIy45Wc5Jy3A5';
var KEY_CODE = (new Buffer(PUBLIC_KEY + ':' + SECRET_KEY).toString('base64'));

var PROTECTED_RESOURCE_API = 'http://webapi-dev-gateway-ext-1832331230.us-east-1.elb.amazonaws.com/v1/tests/security/oauth2/protected-resource';

exports.index = function(req, res) {
  res.render('index', { title: "Test OAuth2 Application" });
};

exports.login = function(req, res) {
  res.redirect('http://webapi-dev-gateway-ext-1832331230.us-east-1.elb.amazonaws.com/v1/tests/security/oauth2/authorize?apikey=' +
               PUBLIC_KEY + '&response_type=code&scope=READ&state=foobar');
};

exports.resource = function(req, res) {
  if (!req.session.access_token) {
    res.redirect('/');
  } else {
    var url = PROTECTED_RESOURCE_API;
    var headers = { Authorization : 'Bearer ' + req.session.access_token };
    request.get({url:url, headers:headers}, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.end(body)
      } else {
        res.write("<h1>Error: " + response.statusCode + "</h1>");
        res.end("<p>" + error.message + "</p>");
      }
    });
  }
};

exports.authcode = function(req, res) {
  // parse authcode
  var authcode = req.query.code;

  // post to token endpoint for access token
  var parameters = 'grant_type=authorization_code&code=' + authcode;

  var postHeaders = { 
    'Authorization': 'Basic ' + KEY_CODE,
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': parameters.length
  };
  var postOptions = {
    host : 'webapi-dev-gateway-ext-1832331230.us-east-1.elb.amazonaws.com',
    path : '/v1/tests/security/oauth2/token',
    port : 80,
    method : 'POST',
    headers : postHeaders
  };

  var reqPost = http.request(postOptions, function (resPost) {
    var jsonString = '';

    resPost.on('data', function(chunk) {
      jsonString += chunk;
    });

    resPost.on('end', function() {
      console.log("JSON DATA: " + jsonString);
      if (resPost.statusCode == 200) {
        var jsonData = JSON.parse(jsonString);
        req.session.access_token = jsonData.access_token;
        req.session.refresh_token = jsonData.refresh_token;
        res.redirect('/resource');
      } else {
        res.end("<h1>" + resPost.statusCode + "</h1><p>" + jsonString + "</p>");
      }
    });
  });

  reqPost.write(parameters);
  reqPost.end();
  reqPost.on('error', function(e) {
    console.log(e.stack);
    res.json(e);
  });
};
