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
//route to authenticate user
apiRoutes.post('/authenticate', function(req, res){

  //find the user
  User.findOne({
    name: req.body.name
  }, function(err, user){
    if (err) throw err;

    if (!user){
      res.json({success: false, message: 'Authentication failed. User not found'});
    } else if (user) {
      //check password
      if (user.password != req.body.password) {
        res.json({success: false, message: 'Authentication failed. Wrong password'});
      } else {
        //user is found and password is correct
        //create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 60*60*24 //24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }

  });
});

//route middleware to verify a token
apiRoutes.use(function(req, res, next){
  //check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  //decode token
  if (token){
    //verify secret and check exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded){

    if (err){
      return res.json({success: false, message: "Failed to authenticate token"});
    } else {
      //if everything is ok, save to request for use in other routes
      req.decoded = decoded;
      next();
    }
  });
} else {
  //if no token return an Error
  return res.status(403).send({
    success: false,
    message: 'No token provided'
  });
}
});

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
