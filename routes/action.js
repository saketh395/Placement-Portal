const express = require('express');
const mysql = require('mysql');
const app = express.Router();


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

app.post("/addstudent", (req, res) => {
  ;
  const usn = req.body.usn;
  const dob = req.body.dob.toString();
  if (usn.length === 0 || dob.length === 0) {
    console.log("null values");
    res.redirect("/addstudent");
  } else {
    connection.query('INSERT INTO student VALUES (?, ?)', [usn, dob], function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/addstudent");
      }
    });
  }
});

app.get("/viewstudent", (req, res) => {
  if (req.isAuthenticated()) {
    connection.query('SELECT * FROM student ORDER BY usn', function(err, user, fields) {
      if (!err) {
        if (user) {
          res.render("admin", {
            pageTitle: 'Admin',
            task: 1,
            userData: user,
          });
        }
      }
    });
  } else {
    res.redirect("/admin_login");
  }
});

app.post("/deleteStudent", (req, res) => {
  if(req.isAuthenticated()){
    const delI = req.body.delI;
    connection.query('DELETE FROM student WHERE usn = ?', [delI], (err ) => {
      if(!err){
        res.redirect("/action/viewstudent");
      }
    });
  }
});

// connection.end();



module.exports = app;
