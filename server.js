var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config'); //secret and db connection
var User = require('./app/models/user'); //schema/model


var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

//bodyparser allows us to get parameters from post requests
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

//home
app.get('/', function(req, res){
  res.send('Hello! The API is at https://localhost:' + port + '/api');
});


//API routes

//start the server
app.listen(port);
console.log('Navi says: "HEY LISTEN": and flies over to https://localhost:' + port);
