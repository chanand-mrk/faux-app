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

exports.authcode = function(req, res) {
  // parse authcode
  var authcode = req.query.code;

  // post to token endpoint for access token
  var http = require('http');
  
  var postHeaders = { 'Authorization': 'Basic ' + keyCode };
  var postOptions = {
    host : 'http://ddn4-test.apigee.net/v1/weather',
    port : 80,
    path : '/oauth/token?grant_type=authorization_code&code=' + authcode + '&scope=READ',
    method : 'POST',
    headers : postHeaders
  };

  var reqPost = http.request(postOptions, function (resPost) {
    resPost.on('data', function(d) {
      // FIXME: temporary output
      res.json(d);
    });
  });

  // save token (session?)
  // display weather page
};
