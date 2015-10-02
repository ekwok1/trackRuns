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

// ROOT

app.get('/', function(req, res) {
  if (req.session.id) {
    db.User.findById(req.session.id, function(err, user){
      res.render('root/index', {req: req, user: user});
    });
  } else {
    res.render('root/index', {req: req, user: null});
  }
});

app.get('/signup', preventLoginSignup, function(req, res) {
  res.render('users/signup');
});

app.get('/login', preventLoginSignup, function(req, res) {
  res.render('users/login');
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// USERS

app.post('/signup', function(req,res){
   db.User.create(req.body.user, function(err, user){
    if (user) {
      req.login(user);
      res.redirect('/');
    } else {
      console.log(err);
    }
  });
});

app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (!err && user !== null) {
      req.login(user);
      res.redirect("/");
    } else {
      console.log(err);
      res.render('users/login');
    }
  });
});

app.get('/users/:id', function(req, res) {
  db.User.findById(req.params.id, function(err, user){
    res.render('users/show', {req:req, user:user});
  });
});

// request('https://maps.googleapis.com/maps/api/directions/json?origin=2820+Regent+St+Berkeley,CA&destination=2820+Regent+St+Berkeley,CA&waypoint=Sliver+Berkeley,CA&key=AIzaSyAZDX1Yddffxd3vbLp-bS7GkPjC-IUPFcA', function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(body); 
//   } else {
//     console.log("what");
//   }
// });

// creating localhost

app.listen(3000, function() {
  console.log("localhost ready");
});





