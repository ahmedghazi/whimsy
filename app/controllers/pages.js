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
    else{
        res.redirect('/security/login');
    }
    
}

var userCan = function (req, res, next) {

   //if(!req.user)return res.redirect('/security/login');
    if(req.user.user_type == "admin")
        return next();

    Posts
        .findOne( { $and: [ 
            { users_in: { $in: [req.user._id] } }, 
            { slug: req.params.slug } 
        ] } )
        .exec(function(err, post) {
            if (err) return next(err);
            
            //console.log("post",post);
            if(post)
                return next();
            else
                res.redirect("/");
        });
};

router.get('/:category', function (req, res, next) {
    
    return Posts
        .find({category: req.params.category})
        //.populate({path:     'image'})
        .populate({
            path:     'images', 
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

router.get('/:category/:slug', isAuthenticated, userCan, function (req, res, next) {
    //console.log(req.params)
    //console.log(req.user)
    if(req.user.user_type == "admin")
        var query = {
            slug: req.params.slug
        }
    else
        var query = {
            slug: req.params.slug,
            users_in : { $in : [req.user._id] }
        }
        var users_in = { $in : [req.user._id] }

    return Posts
        .findOne(query)
        .populate({
            path:     'images', 
            options: { sort: { 'createdAt': -1 } },          
            populate: { path:  'image', model: 'Attachments'}
        })
        .exec(function(err, post) {
            if (err) return next(err);

            var posts2D;
            if(post != null){
                posts2D = arrayTo2DArray(post.images, 4);
            
//console.log(post)
                //var url = root_url+"/"+req.params.category+"/"+req.params.slug
                return res.render('page', {
                    title: post.title,
                    post: post,
                    posts2D: posts2D,
                    user: req.user,
                });
            } else {
                return res.render('page-nothing', {
                    title: "Ce contenu est privé",
                    user: req.user,
                });
            }
        })
});


function arrayTo2DArray (list, howMany) {
    var result = []; input = list.slice(0); 
    while(list[0]) { 
        result.push(list.splice(0, howMany)); 
    }
    return result;
}