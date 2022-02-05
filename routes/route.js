const e = require('express');
const express = require('express');
const mysql = require('mysql');
const app = express.Router();

app.get("/", function (req, res) {
  res.render("home", {
    pageTitle: 'PP : Home'
  });
});


//LOGIN AND CHECKS
app.get("/admin_login", function (req, res) {

  res.render("login", {
    pageTitle: 'Login: Admin',
    userType: 'admin',
    failedAuth: false,
  });
});

app.get("/admin_loginf", function (req, res) {

  res.render("login", {
    pageTitle: 'Login: Admin',
    userType: 'admin',
    failedAuth: true,
  });
});

app.get("/student_login", function (req, res) {
  res.render("login", {
    pageTitle: 'Login: Student',
    userType: 'student',
    failedAuth: false,
  });
});

app.get("/student_loginf", function (req, res) {
  res.render("login", {
    pageTitle: 'Login: Student',
    userType: 'student',
    failedAuth: true,
  });
});


app.get("/company_login", function (req, res) {
  res.render("login", {
    pageTitle: 'Login: Company',
    userType: 'company',
    failedAuth: false,
  });
});


app.get("/company_loginf", function (req, res) {
  res.render("login", {
    pageTitle: 'Login: Company',
    userType: 'company',
    failedAuth: true,
  });
});

app.get("/companyPassCheck", (req, res) => {
  if (req.isAuthenticated()) {

    if (req.user[0].password === req.user[0].c_id) {
      res.redirect("/companyPassChange");
    } else {
      res.redirect("/company");
    }
  } else {
    res.redirect("/company_login");
  }
});

app.get("/companyPassChange", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("company", {
      pageTitle: 'Company: Change Password',
      task: 101,
      passCheck: false
    });
  } else {
    res.redirect("/company_login");
  }
});

//BASE PAGES

app.get("/admin", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/action/adminhome");
  } else {
    res.redirect("/admin_login");
  }

});


app.get("/student", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/action/studenthome");

  } else {
    res.redirect("/student_login");
  }

});


app.get("/company", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/action/companyhome");
  } else {
    res.redirect("/company_login");
  }

});

//ADMIN

app.get("/addstudent", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/action/admin/addstudent")
  } else {
    res.redirect("/admin_login");
  }

});

app.get("/addcompany", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("admin", {
      pageTitle: 'Admin',
      task: 2
    });
  } else {
    res.redirect("/admin_login");
  }

});

app.get("/addbranch", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("admin", {
      pageTitle: 'Admin',
      task: 4
    });
  } else {
    res.redirect("/admin_login");
  }
})

//COMPANY

app.get("/addjob", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/action/company/addjob");
  } else {
    res.redirect("/company_login");
  }
});

app.get("/addexam", function (req, res) {
  if (req.isAuthenticated()) {
    res.render('company', {
      pageTitle: "Company",
      task: 2
    });
  } else {
    res.redirect("/company_login");
  }
});


app.get("/cupdate", function (req, res) {
  if (req.isAuthenticated()) {

    res.render('company', {
      pageTitle: "Company",
      task: 4,
      cname: req.user[0].name,
      ctype: req.user[0].type,
      cdesc: req.user[0].description
    });
  } else {
    res.redirect("/company_login");
  }
});


///STUDENT///
app.get("/buildresume", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("student", {
      pageTitle: 'Student',
      task: 201,
      rexists: false
    });
  } else {
    res.redirect("/student_login");
  }

});




app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/")
});

module.exports = app;