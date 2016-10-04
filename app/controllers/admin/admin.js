var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    backup = require('mongodb-backup'),
    
    Posts = mongoose.model('Posts'),
    Users = mongoose.model('Users'),
    _app;

module.exports = function (app) {
    _app = app;
    app.use('/admin', router);
};

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/security/login');
    }
}

router.get('/', isAuthenticated, function (req, res, next) {
    //console.log(req.user)
    res.render('admin/index', {
        title: 'Admin',
        admin: req.user
    });
});


