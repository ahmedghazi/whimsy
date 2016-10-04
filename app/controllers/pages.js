var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Posts = mongoose.model('Posts');

module.exports = function (app) {
    app.use('/c', isAuthenticated, router);
    //app.use('/c/:category', isAuthenticated, router);
    //app.use('/c/croisieres/:slug', isAuthenticated, userCan, router);
    //app.use('/c/reperages/:slug', isAuthenticated, userCan, router);
    //app.use('/c/:category/:slug', isAuthenticated, userCan, router);
};

var isAuthenticated = function (req, res, next) {
    //return next();
    if (req.isAuthenticated())
        return next();
        res.redirect('/security/login');

    return next();
}

var userCan = function (req, res, next) {
console.log("userCan")
console.log(req.user)
    if(req.user.user_type == "admin")
        return next();

    Posts
        .findOne( { $and: [ 
            { users_in: { $in: [req.user._id] } }, 
            { slug: req.params.slug } 
        ] } )
        .exec(function(err, post) {
            if (err) return next(err);
            
            console.log(post);
            if(post)
                return next();
            else
                res.redirect("/");
        });
};

router.get('/:category', function (req, res, next) {
    console.log(req.params)
    return Posts
        .find({category: req.params.category})
        //.populate({path:     'image'})
        .populate({
            path:     'enfants', 
            options: { sort: { 'createdAt': -1 } },          
            populate: { path:  'image', model: 'Attachments'}
        })
        .exec(function(err, posts) {
            if (err) return next(err);
//console.log(posts)
            return res.render('category', {
                title: req.params.category,
                posts: posts,
            });

        })
});

router.get('/:category/:slug', userCan, function (req, res, next) {
    console.log(req.params)
    return Posts
        .findOne({slug: req.params.slug})
        .populate({
            path:     'enfants', 
            options: { sort: { 'createdAt': -1 } },          
            populate: { path:  'image', model: 'Attachments'}
        })
        .exec(function(err, post) {
            if (err) return next(err);

            var posts2D;
            if(post)
                posts2D = arrayTo2DArray(post.enfants, 4);

            return res.render('page', {
                title: post.title,
                post: post,
                posts2D: posts2D,
                user: req.user,
            });

        })
});


function arrayTo2DArray (list, howMany) {
    var result = []; input = list.slice(0); 
    while(list[0]) { 
        result.push(list.splice(0, howMany)); 
    }
    return result;
}