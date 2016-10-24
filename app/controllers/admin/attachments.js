var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    async = require('async'),
    Posts = mongoose.model('Posts'),
    Attachments = mongoose.model('Attachments'),
    multer  = require('multer'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/')
        },
        filename: function (req, file, cb) {
            var mimetype = "";
            if(file.mimetype == "image/jpeg")mimetype = ".jpg";
            else if(file.mimetype == "image/png")mimetype = ".png";
            else if(file.mimetype == "image/gif")mimetype = ".gif";
            console.log(mimetype)
            cb(null, Date.now() + mimetype) //Appending .jpg
        }
    }),
    upload = multer({ 
        //dest: 'public/uploads/',
        storage: storage,
        onFileUploadStart : function(file){
            console.log('File recieved:');
            console.log(file);
        },
        onFileUploadData:function (file,data){
            console.log('Data recieved');
        },
        onParseEnd: function(req,next){
            next();
        }
    });

module.exports = function (app) {
    app.use('/admin/attachments', isAuthenticated, router);
};

var isAuthenticated = function (req, res, next) {
    //return next();
    if (req.isAuthenticated())
        return next();
        res.redirect('/security/login');
    
    return next();
}



router.get('/all', function (req, res, next) {
    Attachments
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
    Attachments
        .find()
        .sort({date_created: 'desc'})
        .populate({path: 'uploaded_by'})
        .exec(function(err, attachments) {
        //.find(function (err, posts) {
            if (err) return next(err);
         
            res.render('admin/attachments/attachments', {
                title: 'Media',
                attachments: attachments,
                admin: req.user
            });
    });
});

router.get('/new', function (req, res, next) {
    console.log(req.user)
    return res.render('admin/attachments/attachments-new', {
        title: 'Ajouter un media',
        //admin: req.user
        user: req.user
    });
});


var uploadAny = upload.any();
router.post('/new', function (req, res, next) {
    //console.log(req.file)
    console.log(req.files)
    uploadAny(req, res, function (err) {
        if (err) return next(err);
        //return req.files;

        async.each(req.files, function(file, callback) { 
            var attachment = new Attachments(file);
            attachment.uploaded_by = req.body.uploaded_by;
            attachment.save(function(err) {
                if (err) {
                    console.log(_err)
                    return res.send(err);
                }
    
                console.log(file)

                callback();
            });

        }, function(err) {
            if (err) return next(err);

            res.redirect('/admin/attachments/');
        });
    });
    
});

router.get('/edit/:id', function (req, res, next) {
    Attachments
        .findOne({_id: req.params.id})
        .populate({path: 'comments uploaded_by'})
        .exec(function(err, post) {
        //.find(function (err, posts) {
            if (err) return next(err);

            return res.render('admin/attachments/attachments-edit', {
                title: 'Editer',
                post: post,
                admin: req.user
            });
        });
});

router.post('/edit/:id', function (req, res, next) {
    Attachments.findOne({ _id: req.params.id }, function(err, post) {
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

            res.redirect('/admin/attachments/edit/'+req.params.id)
        });
    });
});

router.get('/delete/:id', function (req, res, next) {
    Attachments.remove({
        _id: req.params.id
    }, function(err, post) {
        if (err) {
          return res.send(err);
        }

        res.redirect('/admin/attachments/');
    });
});

router.post('/ajax-new', upload.single("file"), function (req, res, next) {
    var attachment = new Attachments(req.file);
    attachment.save(function(err) {
        if (err) {
            return res.send(err);
        }

        return res.send(attachment);
    });
});

router.get('/attachments-table', function (req, res, next) {
    Attachments
        .find()
        .sort({date_created: 'desc'})
        //.populate({path: 'parent jours'})
        .exec(function(err, attachments) {
        //.find(function (err, posts) {
            if (err) return next(err);
         
            res.render('admin/attachments/attachments-table', {
                title: 'Media',
                attachments: attachments,
                admin: req.user
            });
    });
});