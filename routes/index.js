var http = require('http');
var request = require('request');

var PUBLIC_KEY = 'Gm3viKqHkQRZ1wXChHFVBXQCl70Brfst';
var SECRET_KEY = '0jmY3gxAiICOt4S3';
var KEY_CODE = (new Buffer(PUBLIC_KEY + ':' + SECRET_KEY).toString('base64'));

var WEATHER_API = 'http://ddn4-test.apigee.net/v1/faux-weather/forecastrss';

exports.index = function(req, res) {
  res.render('index', { title: "Faux OAuth App" });
};

exports.login = function(req, res) {
  res.redirect('http://ddn4-test.apigee.net/v1/oauth2/authorize?apikey=' +
               PUBLIC_KEY + '&response_type=code&scope=READ&state=foobar');
};

exports.weather = function(req, res) {
  if (!req.session.access_token) {
    res.redirect('/');
  } else {
    request(WEATHER_API + '?w=12761319', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.end(body)
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
    host : 'ddn4-test.apigee.net',
    path : '/v1/oauth2/token',
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
        res.redirect('/weather');
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
