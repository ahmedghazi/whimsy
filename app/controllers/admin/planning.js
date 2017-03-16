var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    urlSlug = require('url-slug'),
    Planning = mongoose.model('Planning');

module.exports = function (app) {
    app.use('/admin/planning', isAuthenticated, router);
};

var isAuthenticated = function (req, res, next) {
    //return next();
    if (req.isAuthenticated())
        return next();
        res.redirect('/security/login');
    
    return next();
}



router.get('/all', function (req, res, next) {
    Planning
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, docs) {
        //.find(function (err, Planning) {
            if (err) return next(err);
            return res.send(docs);
            
    });
});

router.get('/', function (req, res, next) {
    Planning
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, Planning) {
        //.find(function (err, Planning) {
            if (err) return next(err);
         
            res.render('admin/planning/all', {
                title: 'Planning',
                Planning: Planning,
                admin: req.user
            });
    });
});

router.get('/sort/:k/:s',  function (req, res, next) {
    var s = req.params.s;
    var k = req.params.k;
    Planning
        .find()
        .sort([[k, s]])
        .exec(function(err, Planning) {
            if (err) return next(err);
            
            res.render('admin/planning/all', {
                title: 'Planning',
                Planning: Planning,
                admin: req.user
            });
    });
});

router.get('/filter/:f', function (req, res, next) {
    console.log(req.params.f)
    Planning
        .find({post_type:""+req.params.f+""})
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, Planning) {
        //.find(function (err, Planning) {
            if (err) return next(err);
         
            res.render('admin/planning/all', {
                title: 'Planning',
                Planning: Planning,
                admin: req.user
            });
    });
});

router.post('/search', function (req, res, next) {
    var searchString = req.body.s;
    Planning
        .find({'$or':[
            {'title':{'$regex':searchString, '$options':'i'}},
            //{'first_name':{'$regex':searchString, '$options':'i'}},
            //{'last_name':{'$regex':searchString, '$options':'i'}}
        ]})
        .sort({date_created: 'asc'})
        //.populate({path: 'media_portrait'})
        .exec(function(err, Planning) {
        //.find(function (err, Planning) {
            if (err) return next(err);
            res.render('admin/planning/all', {
                title: 'Planning',
                Planning: Planning,
                admin: req.user
            });
    });
});

router.get('/new', function (req, res, next) {
    Planning
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, Planning) {
        //.find(function (err, Planning) {
            if (err) return next(err);

            return res.render('admin/planning/planning-new', {
                title: 'Ajouter',
                Planning: Planning,
                admin: req.user
            });
        });
});

router.post('/new', function (req, res, next) {
    //console.log(req.body)
    req.body.slug = urlSlug(req.body.title);
    
    var post = new Planning(req.body);
    post.save(function(err) {
        if (err) {
            return res.send(err);
        }

        res.redirect('/admin/planning/');
    });
});

router.get('/edit/:id', function (req, res, next) {
    Planning
        .findOne({_id: req.params.id})
        .populate({path: 'image users_in'})
        .exec(function(err, post) {
        //.find(function (err, Planning) {
            if (err) return next(err);

            return res.render('admin/planning/planning-edit', {
                title: 'Editer',
                post: post,
                admin: req.user
            });
        });

    
});

router.post('/edit/:id', function (req, res, next) {
    Planning.findOne({ _id: req.params.id }, function(err, post) {
        if (err) {
            return res.send(err);
        }

        req.body.slug = urlSlug(req.body.title);
        
        for (prop in req.body) {
            post[prop] = req.body[prop];
        }
        
        if(!req.body.image)post['image'] = null;

        post.save(function(_err) {
            if (_err) {
                console.log(_err)
                return res.send(_err);
            }

            res.redirect('/admin/planning/edit/'+req.params.id)
        });
    });
});


router.get('/delete/:id', function (req, res, next) {
    Planning.remove({
        _id: req.params.id
    }, function(err, post) {
        if (err) {
          return res.send(err);
        }

        res.redirect('/admin/planning/');
    });
});



