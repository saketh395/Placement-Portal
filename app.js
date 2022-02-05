//app.js for sql integration

//requires

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const saltRounds = 10;

//custom route files
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
  database: process.env.DB_DATABASE,
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connection successful");
  }
});

passport.serializeUser(function (user, done) {
  console.log('serializing user:', user);
  done(null, user);
});


passport.deserializeUser(function (username, done) {
  console.log('deserializing user:', username);
  done(null, username);
});


passport.use('admin-login', new LocalStrategy(
  function (username, password, done) {
    connection.query('SELECT * FROM admin WHERE username = ?', [username], function (err, user, fields) {
      bcrypt.compare(password, user[0].password, function (err, result) {
        if (result === true) {
          console.log("Authorized admin");
          return done(null, user);
        } else {
          console.log("Not aothorized");
          return done(err);
        }
      });
    });
  }
));

passport.use('student-login', new LocalStrategy(
  function (username, password, done) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    connection.query("SELECT * FROM student WHERE usn = ?", [username], function (err, user, fields) {
      if (!err) {
        if (user.length === 0) {
          return done(err);
        } else {
          var pass = user[0].dob.toString().slice(4, 15).split(" ");
          var newpass = [];
          newpass.push(pass[2]);
          var mon = months.indexOf(pass[0]) + 1
          if (mon < 10) {
            mon = "0" + mon.toString();
          } else {
            mon = mon.toString();
          }
          newpass.push(mon);
          newpass.push(pass[1])


          if (newpass.join("-") === password.toString()) {
            newpass.reverse();
            user[0].dob = newpass.join("-");
            return done(null, user);
          } else {
            return done(err);
          }
        }
      }
    });
  }
));

passport.use('company-login', new LocalStrategy(
  function (username, password, done) {
    connection.query('SELECT * FROM company WHERE username = ?', [username], function (err, user, fields) {
      if (!err) {

        if (user.length > 0) {
          if (user[0].password === user[0].c_id) {
            return done(null, user, {
              message: 'Found user'
            });
          } else {
            bcrypt.compare(password.toString(), user[0].password, function (err, result) {
              if (result === true) {
                return done(null, user, {
                  message: 'Found user'
                });
              } else {
                return done(err);
              }
            });
          }
        } else {
          return done(err);
        }
      } else {
        return done(err);
      }
    });
  }
));


app.use('/', route);
app.use('/action', action);

app.post('/authenticate/admin', passport.authenticate('admin-login', {
  successRedirect: '/admin',
  failureRedirect: '/admin_loginf'
}), function (req, res) {

});

app.post('/authenticate/student', passport.authenticate('student-login', {
  successRedirect: '/student',
  failureRedirect: '/student_loginf'
}), function (req, res) {

});

app.post('/authenticate/company', passport.authenticate('company-login', {
  successRedirect: '/companyPassCheck',
  failureRedirect: '/company_loginf'
}), function (req, res) {});


// function to register admin with hash. One time thing
// app.post('/authenticate/admin', function(req, res){

//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     // Store hash in your password DB.
//     connection.query('INSERT INTO admin VALUES ("admin", ?) ', [hash], function(err){
//       if(err){
//         console.log(err);
//       }
//     });
//   });

// });


// connection.end();



//listener

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on 3000");
});