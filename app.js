
 require("dotenv").config();

const express = require("express")
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const app = express();
const ExpressError = require("./utils/ExpressError.js");
const flash = require("connect-flash")
const session = require('express-session')
const MongoStore = require("connect-mongo").default;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter= require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
const axios = require("axios");


const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}
main().then(() => {
console.log("succesfully working")
})
.catch((err) => { 
  console.log("DB Connection Error:", err)
});


app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});



const sessionOptions = {
  store,
  secret :process.env.SECRET,
    resave : false,
    saveUninitialized : false,
 cookie : {
      expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge : 7 * 24 * 60 * 60 * 1000,
      httpOnly : true, 
 },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use((req, res, next) => {
    res.locals.MAPTILER_KEY = process.env.MAPTILER_KEY;
    next();
});

//app.get("/demouser" , async(req,res) => {
  //  let fakeUser = new User ({
    //    email: "student@gmail.com",
      //  username : "delta-student",
//    });//

  //  let registeredUser
 //= await User.register(fakeUser, "helloworld")
//res.send(registeredUser)});

//app.get("/", (req,res) => {
  //  res.send("Hi i am root");
//});

app.use("/listings" , listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/" , userRouter);

app.all( /(.*)/,(req,res,next) => {
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next) => {
       console.log("🔥 ERROR START");
    console.log(err.stack);   // shows exact file + line
    console.log("🔥 ERROR END");

let{ statusCode = 500,message = "something went wrong!"} = err;
    res.status(statusCode).send(message);
   
});

app.listen(8080,()=> {
    console.log("server is listining on port 8080");
}); 