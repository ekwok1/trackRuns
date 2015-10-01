// express, ejs, body-parser, method-override,
// mongoose, request, static files
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require("cookie-session"),
    request = require('request');
    // db = require('./models');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(session({
  maxAge: 3600000,
  secret: '___',
  name: "tsocookies"
}));

// creating localhost

app.listen(process.env.PORT || 3000, function() {
  "Server is listening on port 3000";
});