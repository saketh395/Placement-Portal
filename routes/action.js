const { compareSync } = require('bcrypt');
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

app.post("/addjob",(req,res)=>{

  const role = req.body.role;
  const location =req.body.location;
  const branch =req.body.branch;
  const package=parseInt(req.body.package);
  if (role.length === 0 || location.length === 0 || package === 0) {
    console.log("null values");
    res.redirect("/company");
  } else {
    connection.query('INSERT INTO jobs(role,branch,location,package) VALUES (?,?,?,?)', [role,branch,location,package], function(err) {
      if (err) {
        console.log(err);
      } else {
        connection.query('SELECT max(j_id) as ct FROM jobs ', function(err, job){
          if (err) {
            console.log(err);
          }
          else{
          connection.query('INSERT INTO offers VALUES (?,?)', [req.user[0].c_id,job[0].ct], function(err) {
            if (err) {
              console.log(err);
            }
            else{
              res.redirect("/company");
            }
          });
        }
      });
      }
    });
  }

});

app.post("/addexam",(req,res)=>{

  const ename = req.body.ename;
  const edate =req.body.edate;
  const etime=req.body.etime;
  if (ename.length === 0 || edate.length === 0 || etime.length === 0) {
    console.log("null values");
    res.redirect("/company");
  } else {
    connection.query('INSERT INTO exams(ename,date,time) VALUES (?,?,?)', [ename, edate,etime], function(err) {
      if (err) {
        
        console.log(err);
      } else {
        connection.query('SELECT max(e_id) as ct FROM exams ', function(err, exam){
          if (err) {
            console.log(err);
          }
          else{
          connection.query('INSERT INTO creates VALUES (?,?)', [req.user[0].c_id,exam[0].ct], function(err) {
            if (err) {
              console.log(err);
            }
            else{
              res.redirect("/company");
            }
          });
        }
      });
      }
    });
  }

});

app.get("/viewjobs", function (req, res) {
  if (req.isAuthenticated()) {
    const cid = req.user[0].c_id;
    connection.query("select jobs.j_id,jobs.role,jobs.location,jobs.package from offers,jobs where offers.j_id = jobs.j_id AND offers.c_id=?", [cid], function (err, job, fields) {
      if (!err)
        if (job) {
          res.render("company", {
            pageTitle: "Company",
            task: 1,
            jobData: job,
          });
        }
        });
        }
   else
    res.redirect("/company_login");
});


app.get("/viewexams",function(req,res){
  if(req.isAuthenticated()){
    const cid=req.user[0].c_id;
    connection.query("select exams.e_id,exams.ename,exams.date,exams.time from creates,exams where creates.e_id = exams.e_id AND creates.c_id=?",[cid],function(err,exam,fields){
      if(!err)
      if(exam){
        res.render("company",{
          pageTitle:"Company",
          task:3,
        examData : exam,
        });
      }
    });
  }
    else
    res.redirect("/company_login");
      
 });

 app.post("/viewestudents",function(req,res){
  if(req.isAuthenticated()){
    const delI = req.body.delI;
    connection.query("select attempts.e_id,student.usn,student.name,attempts.status from student,attempts where student.usn = attempts.usn AND attempts.e_id=?",[delI],function(err,estud,fields){
      if(!err)
      if(estud){
        res.render("company",{
          pageTitle:"Company",
          task:5,
        estudData : estud,
        });
      }
    });
  }
    else
    res.redirect("/company_login");
      
 });

 app.post("/viewjstudents",function(req,res){
  if(req.isAuthenticated()){
    const delI = req.body.delI;
    connection.query("select applies.j_id,student.usn,student.name,applies.status from student,applies where student.usn = applies.usn AND applies.j_id=?",[delI],function(err,jstud,fields){
      if(!err)
      if(jstud){
        res.render("company",{
          pageTitle:"Company",
          task:6,
        jstudData : jstud,
        });
      }
    });
  }
    else
    res.redirect("/company_login");
      
 });

 app.post("/updateestatus", (req,res)=>{
  if(req.isAuthenticated())
    {
      const status=req.body.status;
      const usn = req.body.usn;
      const e_id = req.body.delI;
      connection.query("update attempts set status=? where e_id=? and usn=?",[status,e_id,usn],function(err){
          if(err)
          console.log(err);
          else
          res.redirect("/action/viewexams");
      });
    }
    else
    res.redirect("/company_login");
  
  });

app.post("/updatejstatus", (req,res)=>{
  if(req.isAuthenticated())
    {
      const status=req.body.jstatus;
      const usn = req.body.usn;
      const j_id = req.body.delI;
      connection.query("update applies set status=? where j_id=? and usn=?",[status,j_id,usn],function(err){
          if(err)
          console.log(err);
          else
          res.redirect("/action/viewjobs");
      });
    }
    else
    res.redirect("/company_login");
  
  });

app.post('/cupdate',function(req,res){
  const cname = req.body.cname;
  const ctype =req.body.ctype;
  const cdesc=req.body.cdesc;
  if(req.isAuthenticated())
  { const cid=req.user[0].c_id;
     connection.query("update company set name=?,c_type=?,description=? where c_id=? ",[cname,ctype,cdesc,cid],function(err){
       if(err)
       console.log(err);
       else
       res.redirect('/company');
     })
  }
  else
  {
    res.redirect("/company_login");
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



app.post("/deletejob", (req, res) => {
  if(req.isAuthenticated()){
    const delI = req.body.delI;
    connection.query('DELETE FROM jobs WHERE j_id = ?', [delI], (err ) => {
      if(!err){
        res.redirect("/action/viewjobs");
      }
    });
  }
  else
  res.redirect("/company_login");
});

app.post("/deleteexam", (req, res) => {
  if(req.isAuthenticated()){
    const delI = req.body.delI;
    connection.query('DELETE FROM exams WHERE e_id = ?', [delI], (err ) => {
      if(!err){
        res.redirect("/action/viewexams");
      }
    });
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
app.post('/addjob',function(req,res){

  console.log("inside addjob");

});

// connection.end();



module.exports = app;
