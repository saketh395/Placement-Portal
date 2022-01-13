//app.js for sql integration

//requires

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const saltRounds = 10;

//custom toute files
const route = require("./routes/route");
const action = require("./routes/action");
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());


// //create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connection successful");
  }
});

// passport.serializeUser(function(user, done) {
//   done(null, user);
// });
//
// passport.deserializeUser(function(user, done) {
//   done(null, user);
// });
passport.serializeUser(function (user, done) {
    done(null, user);
});


passport.deserializeUser(function (username, done) {
    done(null,username);
});


passport.use('admin-login' , new LocalStrategy(
  function(username, password, done) {
    connection.query('SELECT * FROM admin WHERE username = ?', [username], function(err, user, fields){
        bcrypt.compare(password, user[0].password, function(err, result){
          if(result===true){
            console.log("Authorized admin");
            return done(null, user);
          }else{
            console.log("Not aothorized");
            return done(err);
          }
        });
    });
  }
));

passport.use('student-login' , new LocalStrategy(
  function(username, password, done) {

    connection.query("SELECT * FROM student WHERE usn = ?", [ username], function(err, user, fields){

        if(user[0].dob=== password.toString()){
          return done(null, user, {message: 'Found user'});
        }
    });
  }
));

passport.use('company-login' , new LocalStrategy(
  function(username, password, done) {
    connection.query('SELECT * FROM company WHERE name = ?', [username], function(err, user, fields){
        if(user[0].password === password.toString()){
          return done(null, user, {message: 'Found user'});
        }
        else{
          return done(null, false, {message: 'Found user'});
        }
    });
  }
));


app.use('/', route);
app.use('/action', action);

app.post('/authenticate/admin', passport.authenticate('admin-login', { successRedirect: '/admin', failureRedirect:'/admin_loginf' }), function(req, res) {

  });

app.post('/authenticate/student', passport.authenticate('student-login', {successRedirect: '/student', failureRedirect:'/student_loginf'}), function(req, res){

});

app.post('/authenticate/company', passport.authenticate('company-login', {successRedirect: '/company', failureRedirect:'/company_loginf'}), function(req, res){});



// function to register admin with hash. One time thing
// app.post('/authenticate/admin', function(req, res){
//
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     // Store hash in your password DB.
//     connection.query('INSERT INTO admin VALUES ("admin", ?) ', [hash], function(err){
//       if(err){
//         console.log(err);
//       }
//     });
//   });
//
// });


// connection.end();



//listener

app.listen(process.env.PORT || 4000, function() {
  console.log("Server started on 3000");
});
