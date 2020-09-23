var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
const { body, validationResult } = require('express-validator');
var passport = require ('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user'); //access to Mongo User object

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'})
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message: 'Invalid Password'});
      }
    })
  });
}));

router.post('/register', upload.single('profileImage'), [
  body('name').notEmpty().withMessage('Name field is required'),
  body('email').notEmpty().withMessage('Email field is required'),
  body('email').isEmail().withMessage('Email is not valid'),
  body('username').notEmpty().withMessage('Username field is required'),
  body('password').notEmpty().withMessage('Password field is required'),
  body('password2').matches(body.password).withMessage('Passwords do not match')
],function(req, res, next) {
  if(req.file){
    console.log('Uploading File...');
    var profileImage = req.file.filename;
  } else {
    console.log('No File Uploaded...');
    var profileImage = 'default.jpg';
  }
  //Check Errors
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    res.render('register', { 
      title: 'Register',
      errors: errors.array()
  });
  } else {
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      profileImage: profileImage
    });
  }
  User.createUser(newUser, function(err, user){
    if(err) throw err;
    console.log(user);
  });

  req.flash('success', 'You are now registered and can login');

  res.location('/');
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
