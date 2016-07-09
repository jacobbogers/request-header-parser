'use strict';

var express = require('express');
var moment = require('moment');
var compression = require('compression');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var timeout = require('connect-timeout');
var responseTime = require('response-time');
var serveFavicon = require('serve-favicon');
var accepts = require('accepts'); //part of express, so can include it here
var useragent = require('useragent');
var app = express();

function has_props(obj) {
  return (Object.keys(obj).length != 0);
}

function is_number(str) {
  var num = Number.parseFloat(str);
  return Number.isNaN(num) == false;
}

var port = process.env.PORT

app.use(responseTime({
  digits: 4
})); //make this the first middleware
app.use(compression({
  threshold: 1
}));
app.use(logger(':method :url :status :res[content-length] - :response-time ms'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var favIconFile = path.join(__dirname, 'public', 'favicon.ico');

app.use(
  serveFavicon(
    path.join(__dirname, 'public', 'favicon.ico'), {
      maxAge: '1m'
    }
  )
);

app.get("/*", function (req, res, next) {
  // if you are here, time conversion was successfull!
  var rc = {};
  var accept = accepts(req);
  var lang = accept.languages();
  if (lang.length > 0){
      rc.language = lang[0]; // take the first
  }
  var agent = useragent.parse(req.get('user-agent'));
  if (agent && agent.os && agent.os.family){
      rc.software = agent.os.family;
  }
  var x_for = req.get('x-forwarded-for');
  rc.ipaddress = x_for;
  if (!x_for){
      rc.ipaddress = req.ip;//fallback
  }

  res.json(rc);

});

app.use('/css', express.static(__dirname + '/css'));

/* final catch all */
/*
app.use(function(err, req, res, next) {
  if (err) {
    console.log(JSON.stringify(err));
    res.set({
      "X-Error": JSON.stringify(err)
    });
    res.status(500).send({
      unix: null,
      natural: null
    });
  }
});
*/

app.listen(port, function () {
  console.log('The server is running at port:' + port, port);
});
