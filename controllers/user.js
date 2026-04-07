const User = require("../models/user");


module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs")
};
       

module.exports.signup = (req, res, next) => {
    let { username, email, password } = req.body;

    const newUser = new User({ email, username });
    
    User.register(newUser, password, (err, user) => {
        if (err) {
           if(err.name === "UserExistsError"){
            req.flash("error","Username already exists");
            
        } else {
                req.flash("error", "username and password already exists");
         }
          return res.redirect("/users/signup");
        
    }

 req.login(user, (err) => {
            if (err) {
                console.log("🔥 LOGIN ERROR:", err);
                return next(err);
            } 
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
 })
})
};

module.exports.renderLoginForm = (req,res,next) => {
            res.render("users/login.ejs");
        };

        module.exports.login =  async(req,res) => {
             req.flash("success" ,"welcome back to wanderlust" );   
             
             let redirectUrl = res.locals.redirectUrl || "/listings"
                res.redirect(redirectUrl);
            }

            module.exports.logout = (req,res,next) => {
            console.log("LOGOUT HIT");
            req.logout((err) => {
                if(err) {
                return next(err);
            }
            req.flash("success", "you are succesfully logout")
            console.log("FLASH:", req.session); // 👈 ADD THIS

            res.redirect("/listings");
        });
    };