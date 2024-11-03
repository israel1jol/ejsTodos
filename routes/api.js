//Issue WITH escape characters with queries

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const route = require("express").Router();
const csurf = require("csurf");
const csrfProtection = csurf({cookie:true});

const pool = mysql.createPool({
    connectionLimit:10,
    host:"database-1.cf8ikkake4ka.us-east-2.rds.amazonaws.com",
    user:"admin",
    password:"cornflakes",
    database:"projectapp1"
});

const accessMiddleware = (req, res, next) => {
    if(!req.cookies.accToken) next();
    else{
        try{
            jwt.verify(req.cookies.accToken, process.env.accessKey);
            res.redirect("/dashboard");
        } catch(jwtErr){
            res.clearCookie("accToken");
            return res.redirect("/");
        } 
    }
}

const authMiddleware = (req, res, next) => {
    if(!req.cookies.accToken) return res.redirect("/");
    else{
        try{
            const {username, userId} = jwt.verify(req.cookies.accToken, process.env.accessKey);
            pool.query(`SELECT * FROM todo WHERE user_id=${userId}`, (err, todoObj, fields) => {
                if(err) console.log(err);
                req.todo = todoObj;
                req.user = { username, userId };
                next();
            })
        } catch(jwtErr){
            res.clearCookie("accToken");
            return res.redirect("/");
        } 
        
    }
}

route.get("/", accessMiddleware, csrfProtection, (req, res) => {
    res.render("index", {data:"Login", error:{active:false, message:""} , user:undefined, csrfToken:req.csrfToken()});
    res.end();
})

route.get("/register",accessMiddleware,csrfProtection, (req, res) => {
    res.render("index", {data:"Register", error:{active:false, message:"",}, user:undefined, csrfToken:req.csrfToken() });
    res.end();
})

route.get("/dashboard", authMiddleware, csrfProtection, (req, res) => {
    todos = req.todo.filter(t => t.isComplete == 0);
    res.render("profile", {todos:todos, user:req.user.username, csrfToken:req.csrfToken()});
    res.end();
})

route.get("/myList", authMiddleware, csrfProtection, (req, res) => {
    res.render("profile", {todos:req.todo, user:req.user.username, csrfToken:req.csrfToken()});
    res.end();
})

route.post("/", accessMiddleware, csrfProtection, (req, res) => {
    const { username, password } = req.body;
    pool.query(`SELECT * FROM user WHERE username="${username}" LIMIT 1`, async (err, userObj, fields) => {
        if(err) console.log(err);
        else if(userObj.length == 1){
            const val = await bcrypt.compare(password, userObj[0].password);
            if(val){
                const tok = jwt.sign({username:userObj[0].username, userId:userObj[0].id}, process.env.accessKey, {expiresIn:"10h"});
                res.cookie("accToken", tok);
                res.redirect("/dashboard");
            } else res.render("index", {data:"Login", error : {active:true,message:"Invalid Username/Password"}, user:undefined, csrfToken:req.csrfToken()});
        } else res.render("index", {data:"Login", error : {active:true,message:"Invalid Username/Password"}, user:undefined, csrfToken:req.csrfToken()});
    })
})

route.post("/register", accessMiddleware, csrfProtection, (req, res) => {
    const { username, password } = req.body;

    pool.query(`SELECT * FROM user WHERE username='${username}'`, async (err, userObj, fields) => {
        if(err) console.log(err);
        else if(userObj.length > 0) res.render("index", {data:"Register", error : {active:true,message:"User with username already exists"}, user:undefined});
        else{
            const pass =  bcrypt.hashSync(password, 10);
            pool.query(`INSERT INTO user(username, password) VALUES ('${username}', '${pass}')`, (err, result, f) => {
            if(err) console.log(err);
            else res.render("index", {data:"Login", error:{active:false, message:""}, user:undefined});
            });
        }
    })
})

route.post("/todo/:id",csrfProtection, authMiddleware, (req, res) => {
    const id = req.params.id;
    const isComp = req.query.iscomp === "0" ? 1 : 0;
    pool.query(`UPDATE todo SET isComplete=${isComp} WHERE todo.id=${id}`, (err, result, fields) => {
        if(err) console.log(err);
        else res.redirect("back");
    })
})

route.post("/addTodo", csrfProtection, authMiddleware,(req, res) => {
    const title = req.body.title;
    const descr = req.body.descr;
    const isComp = req.body.isComp;
    pool.query(`INSERT INTO todo(title, descr, isComplete, user_id) VALUES ("${title}", "${descr}", ${isComp}, ${req.user.userId})`, (err, result, fields) => {
        if(err) console.log(err);
        else res.redirect("back");
    })
})

route.post("/logout", (req, res) => {
    res.clearCookie("accToken");
    res.redirect("/");
    res.end();
})


module.exports = route;