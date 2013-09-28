var publicKey = '5safzW8a9GABvYJruE9bIgWAPR11guHT';
var secretKey = 'mC4TTQlzmyjP2aVG';
var keyCode = (new Buffer(publicKey + ':' + secretKey).toString('base64'));

exports.index = function(req, res) {
  res.render('index', { title: "Faux OAuth App" });
};

exports.login = function(req, res) {
  res.redirect('http://ddn4-test.apigee.net/v1/weather/oauth/authorize?apikey=' +
               publicKey + '&response_type=code&scope=READ&state=foobar');
};

exports.weather = function(req, res) {
  if (!req.session.access_token) {
    console.log("ACCESS TOKEN: " + req.session.access_token);
    console.log("REFRESH TOKEN: " + req.session.refresh_token);
    res.redirect('/');
  } else {
    res.render('weather');
  }
};

exports.authcode = function(req, res) {
  // parse authcode
  var authcode = req.query.code;

  // post to token endpoint for access token
  var http = require('http');
  
  var parameters = 'grant_type=authorization_code&code=' + authcode;

  var postHeaders = { 
    'Authorization': 'Basic ' + keyCode,
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': parameters.length
  };
  var postOptions = {
    host : 'ddn4-test.apigee.net',
    path : '/v1/weather/oauth/token',
    port : 80,
    method : 'POST',
    headers : postHeaders
  };

  var reqPost = http.request(postOptions, function (resPost) {
    var jsonData = '';

    resPost.on('data', function(chunk) {
      jsonData += chunk;
    });

    resPost.on('end', function() {
      console.log("JSON DATA: " + jsonData);
      if (resPost.statusCode == 200) {
        req.session.access_token = jsonData.access_token;
        req.session.refresh_token = jsonData.refresh_token;
        res.redirect('/weather');
      } else {
        res.end("<h1>" + resPost.statusCode + "</h1><p>" + jsonData + "</p>");
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
