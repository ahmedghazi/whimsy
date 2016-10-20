var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Users = mongoose.model('Users'),
    Posts = mongoose.model('Posts'),
    mailer = require('../../lib/mailer'),
    _app;

module.exports = function (app) {
    _app = app;
    app.use('/admin/users', isAuthenticated, router);
};

var isAuthenticated = function (req, res, next) {
    //return next();
    if (req.isAuthenticated())
        return next();
        res.redirect('/security/login');
    
    return next();
}

router.get('/all', function (req, res, next) {
    Users
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, users) {
        //.find(function (err, posts) {
            if (err) return next(err);
            return res.send(users);
            
    });
});

router.get('/', function (req, res, next) {
    Users
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, users) {
        //.find(function (err, posts) {
            if (err) return next(err);
         
            res.render('admin/users/users', {
                title: 'Users',
                users: users,
                admin: req.user
            });
    });
});


router.get('/new', function (req, res, next) {
    return res.render('admin/users/users-new', {
        title: 'Ajouter un utilisateur',
        admin: req.user
    });
});



router.post('/new', function (req, res, next) {
    console.log(req.body)
    var user = new Users(req.body);
    user.save(function(err) {
        if (err) {
            return res.send(err);
        }

        var body = {}
        body.user = user;
        body.url = _app.locals.root_url;
        var o = {
            email: user.email,
            subject: "Inscription Whimsy",
            body: body,
        }
   
        sendEmail(res, 'standard', o, function(__err, success){
            if(__err){
                console.log(__err)
                throw new Error('Problem sending email to: ' + o.body.email);
            }

            res.redirect('/admin/users/');
        });
        
    });
});

router.get('/edit/:id', function (req, res, next) {
    Users
        .findOne({_id: req.params.id})
        //.populate({path: 'image enfants users_in'})
        .exec(function(err, user) {
        //.find(function (err, posts) {
            if (err) return next(err);

            res.render('admin/users/users-edit', {
                title: 'Users',
                user: user,
                admin: req.user
            });
        });
});

router.post('/edit/:id', function (req, res, next) {
    Users.findOne({ _id: req.params.id }, function(err, user) {
        if (err) {
            return res.send(err);
        }

        for (prop in req.body) {
            user[prop] = req.body[prop];
        }

        user.save(function(_err) {
            if (_err) {
                return res.send(_err);
            }

            res.redirect('/admin/users/edit/'+req.params.id)
        });
    });
});

router.get('/delete/:id', function (req, res, next) {
    Users.remove({
        _id: req.params.id
    }, function(err, user) {
        if (err) {
          return res.send(err);
        }

        res.redirect('/admin/users/');
    });
});

router.get('/users-in-table', function (req, res, next) {
    Users
        .find({user_type: "invite"})
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, users) {
        //.find(function (err, posts) {
            if (err) return next(err);
         
            res.render('admin/users/users-in-table', {
                title: 'Users',
                users: users,
                //admin: req.user
            });
    });
});

function sendEmail(res, template, o, cb){
    res.render('emails/'+template, {
        body:o.body,
        fb_url: o.fb_url,
    }, function(err, html) {
        if (err) {
            console.log(err)
        }

        mailer.sendMail(o.email, o.subject, html, function(err, success){
            if(err){
                throw new Error('Problem sending email to: ' + o.to);
            }

            cb(err,success)
        });

    });
}