const express = require('express');
const mysql = require('mysql2');
const app = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;


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


// ---------------------------------------------------------ADMIN FUNCTIONS---------------------------------------------

app.get("/adminhome", (req, res) => {

  connection.query("SELECT COUNT(*) as snum, b_id FROM student GROUP BY b_id;" +
    "SELECT COUNT(*) as scnt FROM student;" +
    "SELECT COUNT(*) as ccnt FROM company;" +
    "SELECT COUNT(*) as tnum, type FROM company GROUP BY type;",
    function (err, results, fields) {
      if (!err) {
        if (results) {
          // console.log(results);
          var countList = [results[0], results[1][0].scnt, results[2][0].ccnt, results[3]];

          res.render("admin", {
            pageTitle: "Admin",
            task: 100,
            count: countList,
          });
        }
      }
    });
});

app.get("/admin/addstudent", (req, res)=>{
  if(req.isAuthenticated()){
    connection.query('SELECT b_id from branches', function(err, results){
      var branches = [];
      results.forEach((i)=>{
        branches.push(i.b_id);
      })
      res.render("admin", {
        pageTitle: "Admin",
        task: 0,
        branches: branches
      })
    });
  }
  else{
    res.redirect("/admin_login");
  }
});

app.post("/addstudent", (req, res) => {
  const usn = req.body.usn;
  const dob = req.body.dob;
  
  const branch = req.body.branch;
  
  if (usn.length === 0 || dob.length === 0) {
    console.log("null values");
    res.redirect("/addstudent");
  } else {
    connection.query('INSERT INTO student(usn, dob, b_id) VALUES (?, ?, ?)', [usn, dob, branch], function (err) {
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
    connection.query('SELECT * FROM student ORDER BY b_id, usn', function (err, user, fields) {
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
  if (req.isAuthenticated()) {
    const delI = req.body.delI;
    connection.query('DELETE FROM student WHERE usn = ?', [delI], (err) => {
      if (!err) {
        res.redirect("/action/viewstudent");
      }
    });
  }
});

app.post("/addcompany", (req, res) => {
  const name = req.body.name;
  const type = req.body.type;
  if (name.length === 0) {
    console.log("null values");
    res.redirect("/addcompany");
  } else {
    connection.query('UPDATE counter SET ccounter = ccounter+1; SELECT ccounter FROM counter;  ', function (err, count) {
      if (!err) {
        if (count) {
          const c_id = "c" + count[1][0].ccounter.toString();
          connection.query('INSERT INTO company (c_id, username,password,  name, type) VALUES (?, ?,?, ?, ?)', [c_id, c_id,c_id, name, type], function (err) {
            if (err) {
              console.log(err);
            } else {
              res.redirect("/addcompany");
            }
          });
        }else{
          res.redirect("/addcompany");
        }


      }
    })

  }
});


app.get("/viewcompany", (req, res) => {
  if (req.isAuthenticated()) {
    connection.query('SELECT * FROM company ORDER BY c_id', function (err, cmpny, fields) {
      if (!err) {
        if (cmpny) {
          res.render("admin", {
            pageTitle: 'Admin',
            task: 3,
            cmpnyData: cmpny,
          });
        }
      }
    });
  } else {
    res.redirect("/admin_login");
  }
});

app.post("/deleteCompany", (req, res) => {
  if (req.isAuthenticated()) {
    const delI = req.body.delI;
    connection.query('DELETE FROM company WHERE id = ?', [delI], (err) => {
      if (!err) {
        res.redirect("/action/viewcompany");
      }
    });
  }
});

app.post("/addbranch", (req, res)=>{
  if(req.isAuthenticated()){
    const bid= req.body.bid;
    const bname= req.body.bname;
    connection.query('INSERT INTO branches (b_id, b_name) VALUES (?, ?)', [bid, bname], (err, results)=>{
      if(!err){
        if(results){
          res.redirect("/addbranch");
        }
      }else{
        res.send(err);
      }
    });
  }else{
    res.redirect("/admin_login");
  }
})




// ---------------------------------------COMPANY FUNCTIONS-----------------------------------------------------

app.post("/companyPC", (req, res) => {
  if (req.isAuthenticated()) {
    const u = req.body.username;
    const p = req.body.password;
    const pa = req.body.passwordagain;
    if (p != pa) {
      res.render("company", {
        pageTitle: "Company",
        task: 101,
        passCheck: true,
      });
    } else {
      const c_id = req.user[0].c_id;
      bcrypt.hash(p, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        connection.query('UPDATE company SET username = ?,password = ? WHERE c_id = ?', [u, hash, c_id], (err) => {
          if (!err) {
            res.redirect("/company");
          } else {
            res.render("company", {
              pageTitle: "Company",
              task: 101,
              passCheck: true,
            });
          }
        });
      });

    }
  } else {
    res.redirect("/company_login");
  }
});

app.get("/company/addjob", (req, res)=>{
  if(req.isAuthenticated()){
    const c_id = req.user[0].c_id;
    connection.query("SELECT e_id FROM creates WHERE c_id = ?", [c_id], function(err, results){
       if(!err){
         if(results){
           res.render('company',{
             pageTitle:"Company",
             task:0,
             exams: results,
           });
         }
       }else{
         res.send(err);
       }
    });
 
  }else{
    res.redirect("/company_login");
  }
 
 
});

app.post("/addjob", (req, res) => {
  const c_id = req.user[0].c_id;
  const role = req.body.role;
  const e_id = req.body.eid;
  const location = req.body.location;
  const package = parseInt(req.body.package);
  if (role.length === 0 || location.length === 0 || package === 0) {
    console.log("null values");
    res.redirect("/company");
  } else {
    connection.query('UPDATE counter SET jcounter = jcounter+1; SELECT jcounter FROM counter; ', function(err, count){
      if(!err){
        if(count){
          const j_id = c_id.toString()+"-j"+count[1][0].jcounter.toString();
          connection.query('INSERT INTO jobs (j_id, role, location, package, e_id,c_id) VALUES (?,?,?,?,?,?); INSERT INTO offers VALUES (?,?); ', [j_id,role, location, package, e_id,c_id, c_id, j_id], 
          function(err, results){
              if(err){
                res.send(err);
              }else{
                res.redirect("/action/company/addjob");
              }
          });
        }
      }
    });
  }

});

app.post("/addexam", (req, res) => {
  const c_id = req.user[0].c_id;
  const ename = req.body.ename;
  const edate = req.body.edate;
  const etime = req.body.etime;
  if (ename.length === 0 || edate.length === 0 || etime.length === 0) {
    console.log("null values");
    res.redirect("/company");
  } else {
    connection.query('UPDATE counter SET ecounter = ecounter+1; SELECT ecounter FROM counter; ', function(err, count){
      if(!err){
        if(count){
          const e_id = c_id.toString()+"-e"+count[1][0].ecounter.toString();
          connection.query('INSERT INTO exam (e_id, ename, date, time, c_id) VALUES (?,?,?,?,?); INSERT INTO creates VALUES (?, ?)', [e_id, ename, edate, etime, c_id, c_id, e_id], 
          function(err, results){
            if(!err){
              res.redirect("/addexam")
            }else{
              res.send(err);
            }
          });
        }
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
          console.log(job);
          res.render("company", {
            pageTitle: "Company",
            task: 1,
            jobData: job,
          });
        }
    });
  } else
    res.redirect("/company_login");

});

app.get("/viewexams", function (req, res) {
  if (req.isAuthenticated()) {
    const cid = req.user[0].c_id;
    connection.query("select exam.e_id, exam.ename,exam.date,exam.time from creates INNER JOIN exam on creates.e_id = exam.e_id where creates.c_id=?", [cid], function (err, exam, fields) {
      if (!err)
        if (exam) {
          res.render("company", {
            pageTitle: "Company",
            task: 3,
            examData: exam,
          });
        }
    });
  } else
    res.redirect("/company_login");

});

app.post("/deletejob", (req, res) => {
  if (req.isAuthenticated()) {
    const delI = req.body.delI;
    console.log(delI);
    connection.query('DELETE FROM jobs WHERE j_id = ?; DELETE FROM offers WHERE j_id=?', [delI, delI], (err) => {
      if (!err) {
        res.redirect("/action/viewjobs");
      } else {
        console.log(err);
      }
    });
  }
});

app.post("/deleteexam", (req, res) => {
  if (req.isAuthenticated()) {
    const delI = req.body.delI;
    console.log(delI);
    connection.query('DELETE FROM exam WHERE e_id = ?; DELETE FROM offers WHERE e_id=?', [delI, delI], (err) => {
      if (!err) {
        res.redirect("/action/viewexams");
      } else {
        console.log(err);
      }
    });
  }
});
 ///////here/////

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
    
    connection.query("SELECT applies.j_id, applies.usn, student.name, applies.status FROM applies, student where applies.usn= student.usn AND applies.j_id=?",[delI],function(err,jstud,fields){
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
      console.log(status)
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
     connection.query("update company set name=?,type=?,description=? where c_id=? ",[cname,ctype,cdesc,cid],function(err){
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
//view resume in company portal
app.post("/cviewresume", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.body.delI;
    connection.query('SELECT * FROM resume WHERE usn = ?; SELECT * FROM student WHERE usn = ?', [usn, usn], function (err, user, fields) {
      if (!err) {
        console.log(user[0][0]);
          var final = {
            ...user[0][0],
            ...user[1][0]
          };
          console.log(final)

          res.render("company", {
            pageTitle: 'Company',
            task: 102,
            rexists: false,
            userData: final,
          });
        
      }
    });
  } else {
    res.redirect("/company_login");
  }
});


//--------------------------------------------------STUDENT FUNCTIONS-----------------------------------------------------


//exams
app.get("/student/viewexam", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    connection.query('select * FROM exam GROUP BY date; select e_id from attempts where usn = ?; SELECT c_id, name FROM company ', [usn], function (err, results, fields) {
      if (!err) {
        if (results) {
          var companies = {};
          results[2].forEach((i)=>{
            companies[i.c_id] = i.name
            
          });
          
          var applied = [];
          results[1].forEach((i) => {
            applied.push(i.e_id);
          });


          res.render("student", {
            pageTitle: 'Student',
            task: 1,
            results: results[0],
            applied: applied,
            companies: companies
          });


        }
      } else
        res.redirect('/student');
    });
  }
});

app.get("/student/appliedexams", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    connection.query('select * from exam GROUP BY date;  select e_id, status from attempts where usn = ? ; SELECT c_id, name FROM company', [usn], function (err, results, fields) {
      if (!err) {
        if (results) {
          var companies = {};
          results[2].forEach((i)=>{
            companies[i.c_id] = i.name
            
          });
          
          var applied = {};
          results[1].forEach((i)=>{
            applied[i.e_id]=i.status
          }) 

          
          res.render("student", {
            pageTitle: 'Student',
            task: 2,
            results: results[0],
            applied: applied,
            companies: companies
          });
        }
      }
    });
  } else {
    res.redirect("/student_login");
  }
});

//jobs

app.get("/student/viewjobs", (req, res)=>{
  if(req.isAuthenticated()){
    const usn = req.user[0].usn;
    connection.query('SELECT * FROM jobs; SELECT e_id, status FROM attempts WHERE usn = ?; SELECT c_id, name FROM company; SELECT j_id from applies WHERE usn =? ', [usn, usn], (err, results)=>{
      if(!err){
        if(results){
          
          var companies = {};
          results[2].forEach((i)=>{
            companies[i.c_id] = i.name
          });

          var applied = {};
          results[1].forEach((i)=>{
            applied[i.e_id]=i.status
          }) 

          var japplied = []
          results[3].forEach((i)=>{
            japplied.push(i.j_id);
          })
        

          res.render("student", {
            pageTitle:"Student",
            task: 3,
            results: results[0],
            applied: applied,
            japplied: japplied,
            companies: companies
          })
        }
      }else{
        res.send(err);
      }
    });
  }else{
    res.redirect("/student_login");
  }
});

app.get("/student/appliedjobs", (req, res)=>{
  if(req.isAuthenticated()){
    const usn = req.user[0].usn;
    connection.query('SELECT * FROM jobs; SELECT e_id, status FROM attempts WHERE usn = ?; SELECT c_id, name FROM company; SELECT j_id from applies WHERE usn =?', [usn, usn], (err, results)=>{
      if(!err){
        if(results){
          
          var companies = {};
          results[2].forEach((i)=>{
            companies[i.c_id] = i.name
          });

          var applied = {};
          results[1].forEach((i)=>{
            applied[i.e_id]=i.status
          }) 
          var japplied = []
          results[3].forEach((i)=>{
            japplied.push(i.j_id);
          })
          

          res.render("student", {
            pageTitle:"Student",
            task: 4,
            results: results[0],
            applied: applied,
            japplied: japplied,
            companies: companies
          })
        }
      }else{
        res.send(err);
      }
    });
  }else{
    res.redirect("/student_login");
  }
});

//resume

app.get("/viewresume", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    connection.query('SELECT * FROM resume WHERE usn = ?; SELECT * FROM student WHERE usn = ?', [usn, usn], function (err, user, fields) {
      if (!err) {

        if (user.length === 0) {
          res.redirect('/action/resumeCheck');
        } else {

          var final = {
            ...user[0][0],
            ...user[1][0]
          };
          console.log(final)

          res.render("student", {
            pageTitle: 'Student',
            task: 202,
            rexists: false,
            userData: final,
          });
        }
      }
    });
  } else {
    res.redirect("/student_login");
  }
});


app.get("/resumeCheck", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    connection.query('SELECT * FROM resume WHERE usn=?', [usn], function (err, user, fields) {

      if (!err) {
        if (user.length != 0) {

          res.redirect("/action/viewresume");

        } else {
          res.redirect("/buildresume");
        }
      }
    })
  }
});

app.post("/buildresume", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    const deg = req.body.degree_program;
    const fos = req.body.fieldofstudy;
    const cgpa = req.body.cgpa;
    const rel = req.body.rel;
    const hon = req.body.honor;
    const exact = req.body.activity;
    const skill = req.body.skill;
    const hob = req.body.hobbies;
    const comp = req.body.addcompany;
    const job = req.body.job;
    const wdays = req.body.workdays;
    const ptitle = req.body.ptitle;
    const ref = req.body.references;

    connection.query('INSERT INTO resume (usn, deg, fos, cgpa, rel, hon, exact, skill, hob, comp, job, wdays, ptitle, ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [usn, deg, fos, cgpa, rel, hon, exact, skill, hob, comp, job, wdays, ptitle, ref], function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/buildresume");
      }
    });
  } else {
    res.redirect("/student_login");
  }


});

app.get("/editresume", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    connection.query('SELECT * FROM resume WHERE usn = ?', [usn], function (err, user, fields) {
      if (!err) {
        if (user) {
          // console.log(user)

          res.render("student", {
            pageTitle: 'Student',
            task: 203,
            userData: user,
          });
        }
      }
    });
  } else {
    res.redirect("/student_login");
  }

});

app.post("/edit_resume", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    const deg = req.body.degree_program;
    const fos = req.body.fieldofstudy;
    const cgpa = req.body.cgpa;
    const rel = req.body.rel;
    const hon = req.body.honor;
    const exact = req.body.activity;
    const skill = req.body.skill;
    const hob = req.body.hobbies;
    const comp = req.body.addcompany;
    const job = req.body.job;
    const wdays = req.body.workdays;
    const ptitle = req.body.ptitle;
    const ref = req.body.references;

    connection.query('UPDATE resume SET deg=?, fos=?, cgpa=?, rel=?, hon=?, exact=?, skill=?, hob=?, comp=?, job=?, wdays=?, ptitle=?, ref=? WHERE usn=? ', [deg, fos, cgpa, rel, hon, exact, skill, hob, comp, job, wdays, ptitle, ref, usn], function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/action/viewresume");
      }
    });

  } else {
    res.redirect("/student_login");
  }

});

app.post("/applyExam", (req, res) => {
  if (req.isAuthenticated()) {
    const eid = req.body.appliedexam;
    const usn = req.user[0].usn;
    connection.query("INSERT INTO attempts  VALUES (?, ?, 0)", [usn, eid], function (err, results) {
      if (!err) {
        res.redirect("/action/student/viewexam");
      }
    });
  } else {
    res.redirect("/student_login");
  }
});


app.post("/cancelExam", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    const eid = req.body.appliedexam;
    connection.query('DELETE FROM attempts WHERE usn=? AND e_id=?', [usn, eid], function (err, results) {
      if (!err) {
        res.redirect("/action/student/appliedexams");
      }
    });
  } else {
    res.redirect("/student_login");
  }
});


app.post("/applyJob", (req, res)=>{
  if(req.isAuthenticated()){
    const usn = req.user[0].usn;
    const jid = req.body.appliedjob;
    connection.query('INSERT INTO applies(j_id,usn) VALUES (?,?)', [jid, usn], (err, results)=>{
      if(!err){
        res.redirect("/action/student/viewjobs")
      }else{
        res.send(err);
      }
    })
  }else{
    res.redirect("/student_login");
  }
});


app.post("/cancelJob", (req, res) => {
  if (req.isAuthenticated()) {
    const usn = req.user[0].usn;
    const jid = req.body.appliedjob;
    connection.query('DELETE FROM applies WHERE usn=? AND j_id=?', [usn, jid], function (err, results) {
      if (!err) {
        res.redirect("/action/student/appliedjobs");
      }else{
        res.send(err);
      }
    });
  } else {
    res.redirect("/student_login");
  }
});


// connection.end();



//helper functions

function emptyCountList() {
  countList = [];
}

function addValue(value) {
  countList.push(value);

}

module.exports = app;