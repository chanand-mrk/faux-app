exports.index = function(req, res) {
  res.render('index', { title: "Faux OAuth App" });
};

exports.login = function(req, res) {
  res.redirect('http://ddn4-test.apigee.net/v1/weather/oauth/authorize?apikey=5safzW8a9GABvYJruE9bIgWAPR11guHT&response_type=code&scope=READ&state=foobar');
};

exports.authcode = function(req, res) {
  //
};
