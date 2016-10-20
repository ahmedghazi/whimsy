var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    _app,
    urlSlug = require('url-slug'),
    async = require('async'),
    Posts = mongoose.model('Posts'),
    Users = mongoose.model('Users'),
    Posts = mongoose.model('Posts'),
    Comments = mongoose.model('Comments'),
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
    _app = app;
    app.use('/api', router);
};

router.get('/update-admin', function (req, res, next) {
    var body = {
        email:"admin76",
        password:"a27Le5GB",
        user_type:"admin"
    }

    Users.findOneAndUpdate({user_type: "admin"}, body, {}, function (err, user, raw) {
        res.redirect('/');
    });
});

router.get('/setup', function (req, res, next) {
    var body = {
        email:"admin",
        password:"pass",
        user_type:"admin"
    }

    var user = new Users(body);
    user.save(function(err) {
        if (err) {
            return res.send(err);
        }

        res.redirect('/');
    });
    
});

router.get('/image/:id', function (req, res, next) {
    //console.log("dddd")
    return Attachments
        .findOne({_id: req.params.id})
        .populate({
            path:     'comments uploaded_by',
            //options: { sort: { 'post_order': 1 } },      
            populate: { path:  'author', model: 'Users'}
        })
        .exec(function(err, post) {
            if (err) return next(err);
//console.log(post)
            
            return res.render('posts/card-full', {
                title: post.title,
                post: post,
                user: req.user
            });

        })
});

router.post('/:id/comment', function (req, res, next) {
    var comment = new Comments(req.body);
        comment.save(function(err) {
        if (err) {
            return res.send(err);
        }

        var update = { $addToSet: {comments: comment._id } }
        Attachments.findOneAndUpdate({_id: req.body.parent}, update, {}, function (err, user, raw) {
            if (err) 
                return res.json({sucess:false, err:err});

            Comments
                .findOne({_id: comment._id})
                .populate({path: 'author'})
                .exec(function(err, com) {
            console.log(com)
                    return res.render('posts/comment', {
                        comment: com,
                        //user: comment.author
                    }, function(err, html){
                        return res.json({sucess:true, comment:html});
                    });
                });
            
        });
    });
});
/*
router.post('/:id/upload', upload.single("media"), function (req, res, next) {
    //console.log(req.file)
    //return req.file;
    var attachment = new Attachments(req.file);
    attachment.uploaded_by = req.body.uploaded_by;
    attachment.save(function(err) {
        if (err) {
            return res.send(err);
        }

        var slug = urlSlug(req.body.title);
        
        var post = new Posts(req.body);
        post.slug = slug;
        post.image = attachment._id
        post.save(function(err) {
            if (err) {
                return res.json({sucess:false, err:err});
            }
            var update = { $addToSet: {enfants: post._id } }
            Posts.findOneAndUpdate({_id: req.body.parent}, update, {}, function (err, user, raw) {
                if (err) 
                    return res.json({sucess:false, err:err});
                
                Posts
                    .findOne({_id: post._id})
                    .populate({path: 'image'})
                    .exec(function(err, post) {
                
                        return res.render('posts/card-3', {
                            p: post,
                            //user: comment.author
                        }, function(err, html){
                            return res.json({sucess:true, post:html});
                        });
                    });
            });
            //res.redirect('/admin/posts/');
        });
        //res.redirect('/admin/attachments/');
    });
});
*/
var uploadAny = upload.any();
router.post('/:id/upload', function (req, res, next) {
    //console.log(req.file)
    console.log(req.files)
    uploadAny(req, res, function (err) {
        if (err) return next(err);
        //return req.files;
        var images = [];
        async.each(req.files, function(file, callback) { 
            var attachment = new Attachments(file);
            attachment.uploaded_by = req.body.uploaded_by;
            attachment.save(function(err) {
                if (err) {
                    console.log(_err)
                    return res.send(err);
                }
    
                //console.log(file)
                images.push(attachment._id)
                callback();
                
            });

        }, function(err) {
            if (err) return next(err);
console.log(images)
            var update = { $pushAll: {images: images } }
            Posts.findOneAndUpdate({_id: req.body.parent}, update, {}, function (err, post, raw) {
                console.log(err, post, raw)
                if (err) 
                    return res.json({sucess:false, err:err});
                console.log(post)
                return res.json({sucess:true});
            });

            
        });
    });
    
});