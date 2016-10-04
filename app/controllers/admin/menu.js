var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    urlSlug = require('url-slug'),
    Posts = mongoose.model('Posts');

module.exports = function (app) {
    app.use('/admin/menu', router);
};

var isAuthenticated = function (req, res, next) {
    return next();
    if (req.isAuthenticated())
        return next();
        res.redirect('/security/login');
    
    return next();
}




