// express, ejs, body-parser, method-override,
// mongoose, request, static files
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require("cookie-session"),
    request = require('request'),
    loginMiddleware = require('./middleware/loginHelper'),
    routeMiddleware = require('./middleware/routeHelper'),
    ensureLoggedIn = routeMiddleware.ensureLoggedIn,
    preventLoginSignup = routeMiddleware.preventLoginSignup,
    db = require('./models');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(session({
  maxAge: 3600000,
  secret: 'secret',
  name: "tsocookies"
}));

app.use(loginMiddleware);

// USERS

app.get('/', function(req, res) {
  res.render('root/index');
});

app.get('/signup', function(req, res) {
  res.render('users/signup');
});

app.get('/login', function(req, res) {
  res.render('users/login');
});

// creating localhost

app.listen(3000, function() {
  console.log("localhost ready");
});





