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

//sample User
app.get('/setup', function(req,res){
  var marc = new User({
    name: 'Marc',
    password: 'password',
    admin: true
  });

  marc.save(function(err){
    if (err) throw err;

    console.log('User saved successfully');
    res.json({success: true});
  });
});


//API ROUTES

//get an instance of the router
var apiRoutes = express.Router();

//To do: route to authenticate a user (POST http://localhost:8080/api/authenticate)

//To do: route middleware to verify a token

//route to show a message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req,res){
  res.json({message: "Don't go JSON Waterfalls"});
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res){
  User.find({}, function(err, users) {
    res.json(users);
  });
});

//apply the routes tou our application with the prefix /api
app.use('/api', apiRoutes);



//start the server
app.listen(port);
console.log('Navi says: "HEY LISTEN": and flies over to https://localhost:' + port);
