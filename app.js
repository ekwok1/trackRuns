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
  res.render('users/signup', {err: null});
});

app.get('/login', preventLoginSignup, function(req, res) {
  res.render('users/login', {err: null});;
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
      if (err.name === 'ValidationError') {
        res.render('users/signup', {err:"Validation Error! Please fill out all fields."});
      } else {
        res.render('users/signup', {err:err});
      }   
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
      res.render('users/login', {err:err});
    }
  });
});

app.get('/users/:id', function(req, res) {
  db.User.findById(req.params.id, function(err, user){
    db.Run.find({
      _id: {$in: user.runs}
    }, function(err2, runs){
      res.render('users/show', {req:req, user:user, runs:runs});
    });
  });
});

app.get('/users/:id/runs', function(req, res) {
  db.User.findById(req.params.id, function(err, user){
    db.Run.find({
      _id: {$in: user.runs}
    }, function(err2, runs){
      res.render('users/show', {req:req, user:user, runs:runs});
    });
  });
});

// RUNS

app.get('/users/:id/runs/new', function(req, res) {
  db.User.findById(req.params.id, function(err, user){
    res.render('runs/new', {req:req, user:user, err:null});
  });
});

function timeConverter(num){
  var count = 0;
  while (num > 1) {
    num--;
    count++;
  }
  return count;
}

app.post('/users/:id/runs', function(req,res) {
  db.User.findById(req.params.id, function(err2, user2){
    request('https://maps.googleapis.com/maps/api/directions/json?origin='+req.body.origin+'&destination='+req.body.destination+'&key=AIzaSyAZDX1Yddffxd3vbLp-bS7GkPjC-IUPFcA',
      function(error, response, body){
        if (!error && response.statusCode === 200) {
          var parsedBody = JSON.parse(body),
              origin = parsedBody.routes[0].legs[0].start_address,
              destination = parsedBody.routes[0].legs[0].end_address,
              distance = parsedBody.routes[0].legs[0].distance.text,
              timeMinutes = Number(req.body.timeMinutes),
              timeSeconds = Number(req.body.timeSeconds),

              numberDistance = Number(distance.split(' ')[0]),
              totalTime = timeSeconds/60 + timeMinutes,
              averageMile = totalTime/numberDistance,
              averageMileMinute = timeConverter(averageMile),
              averageMileSecond = parseInt((averageMile - averageMileMinute)*60);

          db.Run.create({
            origin: origin,
            destination: destination,
            distance: distance,
            timeMinutes: timeMinutes,
            timeSeconds: timeSeconds,
            averageMileMinute: averageMileMinute,
            averageMileSecond: averageMileSecond
          }, function(err, run){
            if (err) {
              res.render('runs/new', {req:req, user:user, err:"Validation Error! Please fill out all fields."});
            } else {
              db.User.findById(req.params.id, function(err, user){
                user.runs.push(run);
                run.user = user.id;
                run.save();
                user.save();
                db.Run.find(
                {
                  _id: {$in: user.runs}
                }, function(err3, runs){
                  if (err3) {
                    console.log('what');
                  } else {
                    res.render('users/show', {req:req, user:user, runs:runs});
                  }
                });
              });
            }
          });
        } else {
          console.log(err);
        }
      });
  });
});

app.get('/runs/:id', function(req, res) {
  db.Run.findById(req.params.id, function(err, runs){
    res.render('runs/show', {req:req, runs:runs});
  });
});

app.get('/runs/:id/edit', function(req, res) {
  db.Run.findById(req.params.id, function(err, runs){
    res.render('runs/edit', {req:req, runs:runs});
  });
});

app.put('/runs/:id', function(req, res) {
  request('https://maps.googleapis.com/maps/api/directions/json?origin='+req.body.origin+'&destination='+req.body.destination+'&key=AIzaSyAZDX1Yddffxd3vbLp-bS7GkPjC-IUPFcA',
    function(error, response, body){
      if (!error && response.statusCode === 200) {
        var parsedBody = JSON.parse(body),
            origin = parsedBody.routes[0].legs[0].start_address,
            destination = parsedBody.routes[0].legs[0].end_address,
            distance = parsedBody.routes[0].legs[0].distance.text,
            timeMinutes = Number(req.body.timeMinutes),
            timeSeconds = Number(req.body.timeSeconds),

            numberDistance = Number(distance.split(' ')[0]),
            totalTime = timeSeconds/60 + timeMinutes,
            averageMile = totalTime/numberDistance,
            averageMileMinute = timeConverter(averageMile),
            averageMileSecond = parseInt((averageMile - averageMileMinute)*60);

        db.Run.findByIdAndUpdate(req.params.id, 
        {
          origin: origin,
          destination: destination,
          distance: distance,
          timeMinutes: timeMinutes,
          timeSeconds: timeSeconds,
          averageMileMinute: averageMileMinute,
          averageMileSecond: averageMileSecond
        }, 
        function(err, run){
          res.redirect('/users/'+req.session.id);
        });
      }
  });
});

app.delete('/runs/:id', function(req, res){
  db.Run.findByIdAndRemove(req.params.id, function(err, runs){
    res.redirect('/users/'+req.session.id);
  });
});

// creating localhost

app.listen(3000, function() {
  console.log("localhost ready");
});





