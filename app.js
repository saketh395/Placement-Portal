//app.js for sql integration

//requires

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require('mysql');


const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//gets
app.get("/", function(req, res){
  res.render("home", {pageTitle: 'PP : Home'});
});

app.get("/admin_login", function(req, res){
  res.render("login", {pageTitle:'Login: Admin', userType:'admin'});
});

app.get("/student_login", function(req, res){
  res.render("login", {pageTitle:'Login: Student', userType:'student'});
});

app.get("/company_login", function(req, res){
  res.render("login", {pageTitle:'Login: Company', userType:'company'});
});

//create connection
// const connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   database : 'sqlnpmtest'
// });
//
// //connect
// connection.connect((err) => {
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Connection successful");
//   }
// });
//
// //simple query
// connection.query('SELECT * FROM Test', function (err, results, fields) {
//   if (err) throw error;
//   console.log(results);
// });
//
// connection.end();

app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on 3000");
});
