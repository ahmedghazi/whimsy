var express         = require('express');
var glob            = require('glob');

var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');

var compress        = require('compression');
var methodOverride  = require('method-override');
var flash           = require('connect-flash');
var os              = require("os");

var passport        = require('passport');
//require('./config/passport')(passport); // pass passport for configuration

module.exports = function(app, config) {
    var env = process.env.NODE_ENV || 'development';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env == 'development';

    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');

    // app.use(favicon(config.root + '/public/img/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(compress());
    app.use(express.static(config.root + '/public'));
    app.use(methodOverride());
    app.use(session({ 
        secret: process.env.SESSION_SECRET || "blabla",
        resave: true,
        saveUninitialized: true,

    })); // session secret

    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

    app.locals.moment = require('moment');
    app.locals.moment.locale("fr");


    if(os.homedir() == "/Users/ahmedghazi"){
        app.locals.root_url = "http://localhost:3000";
        
    }else{
        //app.locals.root_url = "http://krogen.fr";
        //app.locals.root_admin_url = "http://admin.krogen.fr";
    }

    //app.locals.root_url = "http://ikea.server.soixanteseize-lab.com";
    //app.locals.root_admin_url = "http://ikea-admin.server.soixanteseize-lab.com";
    
    var controllers = glob.sync(config.root + '/app/controllers/*/*.js');
        controllers.forEach(function (controller) {
        require(controller)(app);
    });

    var controllers = glob.sync(config.root + '/app/controllers/*.js');
        controllers.forEach(function (controller) {
        require(controller)(app);
    });

    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if(app.get('env') === 'development'){
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err,
                title: 'error'
            });
        });
    }

    app.use(function (err, req, res, next) {
    res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {},
            title: 'error'
        });
    });

  

};

function ttt(){
    return "rrr";
}

