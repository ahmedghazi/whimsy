var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    flash = require ('connect-flash'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
    Users = mongoose.model('Users'),
    redirect_to = "/";

module.exports = function (app) {
    app.use('/security', router);
};

// As with any middleware it is quintessential to call next()
// if the user is authenticated
/*
var isAuthenticated = function (req, res, next) {
if (req.isAuthenticated())
    return next();
    res.redirect('/admin/login');
}*/



//passport.use(new LocalStrategy(function(username, password, done) {
passport.use('local', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
}, function(req, username, password, done) {
    //console.log(User)
    console.log(username)
    console.log(password)
    process.nextTick(function() {
        Users.findOne({'email': username}, function(err, user) {
            if (err) {
                console.log(err)
                return done(err);
            }
            //console.log(user)
            if (!user) {
                return done(null, false, { message: 'Login incorrect.' });
            }else if(user.password != password){
                return done(null, false, { message: 'Password incorrect.' });
            }/*else if(user.user_type != "admin" ){
                return done(null, false, { message: "Vous n'avez pas les droits suffisants." });
            }*/else{
                redirect_to = user.user_type == "admin" ? "/admin" : "/";
                console.log(user.user_type);
                //console.log(redirect_to);
                return done(null, user);
            }

        });
    });

}));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
    Users.findById(id, function(err, user) {
        done(err, user);
    });
});


 
router.get('/login', function (req, res, next) {
    //console.log(flash('info'));
    //console.log("get login : ",req.flash('error'));
    return res.render('security/login', {
        title: 'Login',
        errors: req.flash('error')
    });
});

/*router.post('/login', passport.authenticate('local', {
    successRedirect : redirect_to, // redirect to the secure profile section
    failureRedirect : '/security/error', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));*/

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if ( err ) {
            next(err);
            return
        }
        // User does not exist
        if ( ! user ) {
            req.flash('error', 'Infos');
            res.redirect('/security/login');
            return
        }
        req.logIn(user, function(err) {
            // Invalid password
            if ( err ) {
                req.flash('error', 'Infos');
                next(err);
                return
            }
            res.redirect(redirect_to);
            return
        });
    })(req, res, next);
});

/*
router.get('/error', function(req, res, next) {
    //console.log("error");
    //console.log("get error : "+req.flash("error"));
    req.flash('info', "Infos");
    //req.flash('info', 'Flash is back!')
    res.redirect('/security/login');
});
*/

router.get('/register', function (req, res, next) {
    console.log("register");
    res.render('security/register', {
        title: 'Register'
    });
});

router.post('/register', function (req, res, next) {
    Users.register(new Users({ email : req.body.email }), req.body.password, function(err, account) {
        if (err) {
            return res.render("security/register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});



