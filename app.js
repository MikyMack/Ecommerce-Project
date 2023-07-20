const express = require('express')
const app = express()
const path = require('path')
const config = require("./config/config");
const session = require("express-session");
require('./config/database.js')
const mongoSanitize = require('express-mongo-sanitize');
const userRoute = require("./routes/userRoute.js");
const adminRoute = require("./routes/admin.js");
const nocache=require('nocache')
const { appendFile } = require('fs');
 
app.use(session({ 
    secret: config.sessionSecret,
    resave:false,
    saveUninitialized:true,
    cookie: { secure: false }
}));

app.set("view engine", "ejs");
app.set("views", "views/");  

app.use(express.static(path.resolve("./Public")));
app.use(mongoSanitize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());

// for admin routes
app.use("/admin", adminRoute);

//for user routes
app.use("/", userRoute);

//for forgot password
// app.use("/forgot", forgotPassword);

app.all("*", (req, res) => {
    res.render("error")
  })
  
app.listen(5000, function(){         
    console.log("server running at 5000")     
})

