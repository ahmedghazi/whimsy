var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    urlSlug = require('url-slug'),
    Posts = mongoose.model('Posts');

module.exports = function (app) {
    app.use('/admin/posts', isAuthenticated, router);
};

var isAuthenticated = function (req, res, next) {
    //return next();
    if (req.isAuthenticated())
        return next();
        res.redirect('/security/login');
    
    return next();
}



router.get('/all', function (req, res, next) {
    Posts
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, docs) {
        //.find(function (err, posts) {
            if (err) return next(err);
            return res.send(docs);
            
    });
});

router.get('/', function (req, res, next) {
    Posts
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, posts) {
        //.find(function (err, posts) {
            if (err) return next(err);
         
            res.render('admin/posts/posts', {
                title: 'Posts',
                posts: posts,
                admin: req.user
            });
    });
});

router.get('/sort/:k/:s',  function (req, res, next) {
    var s = req.params.s;
    var k = req.params.k;
    Posts
        .find()
        .sort([[k, s]])
        .exec(function(err, posts) {
            if (err) return next(err);
            
            res.render('admin/posts/posts', {
                title: 'Posts',
                posts: posts,
                admin: req.user
            });
    });
});

router.get('/filter/:f', function (req, res, next) {
    console.log(req.params.f)
    Posts
        .find({post_type:""+req.params.f+""})
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, posts) {
        //.find(function (err, posts) {
            if (err) return next(err);
         
            res.render('admin/posts/posts', {
                title: 'Posts',
                posts: posts,
                admin: req.user
            });
    });
});

router.post('/search', function (req, res, next) {
    var searchString = req.body.s;
    Posts
        .find({'$or':[
            {'title':{'$regex':searchString, '$options':'i'}},
            //{'first_name':{'$regex':searchString, '$options':'i'}},
            //{'last_name':{'$regex':searchString, '$options':'i'}}
        ]})
        .sort({date_created: 'asc'})
        //.populate({path: 'media_portrait'})
        .exec(function(err, posts) {
        //.find(function (err, posts) {
            if (err) return next(err);
            res.render('admin/posts/posts', {
                title: 'Posts',
                posts: posts,
                admin: req.user
            });
    });
});

router.get('/new', function (req, res, next) {
    Posts
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, posts) {
        //.find(function (err, posts) {
            if (err) return next(err);

            return res.render('admin/posts/posts-new', {
                title: 'Ajouter',
                posts: posts,
                admin: req.user
            });
        });
});

router.post('/new', function (req, res, next) {
    //console.log(req.body)
    req.body.slug = urlSlug(req.body.title);
    
    var post = new Posts(req.body);
    post.save(function(err) {
        if (err) {
            return res.send(err);
        }

        res.redirect('/admin/posts/');
    });
});

router.get('/edit/:id', function (req, res, next) {
    Posts
        .findOne({_id: req.params.id})
        .populate({path: 'images users_in'})
        .exec(function(err, post) {
        //.find(function (err, posts) {
            if (err) return next(err);

            return res.render('admin/posts/posts-edit', {
                title: 'Editer',
                post: post,
                admin: req.user
            });
        });

    
});

router.post('/edit/:id', function (req, res, next) {
    Posts.findOne({ _id: req.params.id }, function(err, post) {
        if (err) {
            return res.send(err);
        }

        for (prop in req.body) {
            post[prop] = req.body[prop];
        }

        post.save(function(_err) {
            if (_err) {
                console.log(_err)
                return res.send(_err);
            }

            res.redirect('/admin/posts/edit/'+req.params.id)
        });
    });
});


router.get('/delete/:id', function (req, res, next) {
    Posts.remove({
        _id: req.params.id
    }, function(err, post) {
        if (err) {
          return res.send(err);
        }

        res.redirect('/admin/posts/');
    });
});


router.get('/posts-table', function (req, res, next) {
    Posts
        .find({post_type:"image"})
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, posts) {
        //.find(function (err, posts) {
            if (err) return next(err);
         
            res.render('admin/posts/posts-enfants-table', {
                title: 'Posts',
                enfants: posts,
                admin: req.user
            });
    });
});

router.get('/posts-in-table', function (req, res, next) {
    Posts
        .find({post_type:"page"})
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, posts) {
        //.find(function (err, posts) {
            if (err) return next(err);
         
            res.render('admin/posts/posts-in-table', {
                title: 'Posts',
                enfants: posts,
                admin: req.user
            });
    });
});
