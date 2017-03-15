var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Planning = mongoose.model('Planning');

module.exports = function (app) {
    app.use('/p', isAuthenticated, router);
    //app.use('/c/:category', isAuthenticated, router);
    //app.use('/c/croisieres/:slug', isAuthenticated, userCan, router);
    //app.use('/c/reperages/:slug', isAuthenticated, userCan, router);
    //app.use('/c/:category/:slug', isAuthenticated, userCan, router);
};

var isAuthenticated = function (req, res, next) {
    //return next();
    if (req.isAuthenticated())
        return next();
    else{
        res.redirect('/security/login');
    }
    
}

var userCan = function (req, res, next) {
    if(req.user.user_type == "admin")
        return next();

    Planning
        .findOne( { $and: [ 
            { users_in: { $in: [req.user._id] } }, 
            { slug: req.params.slug } 
        ] } )
        .exec(function(err, post) {
            if (err) return next(err);
            
            console.log("post",post);
            if(post)
                return next();
            else
                res.redirect("/");
        });
};

router.get('/', function (req, res, next) {
    return Planning
        .find()
        //.populate({path:     'image'})
        .populate({
            path:     'image', 
            options: { sort: { 'createdAt': -1 } }
        })
        .exec(function(err, Planning) {
            if (err) return next(err);
//console.log(Planning)
            return res.render('planning-liste', {
                posts: Planning,
            });

        })
});

router.get('/:slug', function (req, res, next) {
    return Planning
        .findOne({slug: req.params.slug})
        //.populate({path:     'image'})
        .populate({
            path:     'image', 
            options: { sort: { 'createdAt': -1 } },          
            populate: { path:  'image', model: 'Attachments'}
        })
        .exec(function(err, Planning) {
            if (err) return next(err);
console.log(Planning)
            return res.render('planning-single', {
                post: Planning,
            });

        })
});




