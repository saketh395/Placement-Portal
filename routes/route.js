const express = require('express');
const mysql = require('mysql');
const app = express.Router();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   database: process.env.DB_DATABASE
// });
//
// connection.connect((err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Connection successful");
//   }
// });

app.get("/", function(req, res) {
  res.render("home", {
    pageTitle: 'PP : Home'
  });
});

app.get("/admin_login", function(req, res) {

  res.render("login", {
    pageTitle: 'Login: Admin',
    userType: 'admin',
    failedAuth: false,
  });
});

app.get("/admin_loginf", function(req, res) {

  res.render("login", {
    pageTitle: 'Login: Admin',
    userType: 'admin',
    failedAuth: true,
  });
});

app.get("/student_login", function(req, res) {
  res.render("login", {
    pageTitle: 'Login: Student',
    userType: 'student',
    failedAuth: false,
  });
});

app.get("/student_loginf", function(req, res) {
  res.render("login", {
    pageTitle: 'Login: Student',
    userType: 'student',
    failedAuth: true,
  });
});


app.get("/company_login", function(req, res) {
  res.render("login", {
    pageTitle: 'Login: Company',
    userType: 'company',
    failedAuth: false,
  });
});


app.get("/company_loginf", function(req, res) {
  res.render("login", {
    pageTitle: 'Login: Company',
    userType: 'company',
    failedAuth: true,
  });
});

app.get("/admin", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("admin", {
      pageTitle: 'Admin',
      task: 9
    });
  } else {
    res.redirect("/admin_login");
  }

});

app.get("/student", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("student", {
      pageTitle: 'Student'
    });
  } else {
    res.redirect("/student_login");
  }

});

app.get("/company", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("company", {
      pageTitle: 'Company'
    });
  } else {
    res.redirect("/company_login");
  }

});

app.get("/addstudent", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("admin", {
      pageTitle: 'Admin',
      task: 0
    });
  } else {
    res.redirect("/admin_login");
  }

});





app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/")
});

module.exports = app;
