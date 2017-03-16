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
    Planning = mongoose.model('Planning'),
    //easyimg = require('easyimage'),
    imagemagick = require('imagemagick'),
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
            //console.log(mimetype)
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

router.post('/attachments/:id/comment', function (req, res, next) {
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

router.post('/planning/:id/comment', function (req, res, next) {
    var comment = new Comments(req.body);
        comment.save(function(err) {
        if (err) {
            return res.send(err);
        }

        var update = { $addToSet: {comments: comment._id } }
        Planning.findOneAndUpdate({_id: req.body.parent}, update, {}, function (err, user, raw) {
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

var uploadAny = upload.any();
router.post('/:id/upload', function (req, res, next) {
    //console.log(req.file)
    //console.log(req.files)
    uploadAny(req, res, function (err) {
        if (err) return next(err);
        //return req.files;
        var images = [];
        async.each(req.files, function(file, callback) { 
            //console.log(file)
            var image1024,image300;

            var name = file.filename.split(".")[0];
            var extention = file.filename.split(".")[1];

            imagemagick.resize({
                srcPath: file.path,
                dstPath: file.destination+name+"-1024x1024."+extention,
                width:   1024
            }, function(err, stdout, stderr){
                if (err) throw err;
              
                image1024 = name+"-1024x1024."+extention;
                
                imagemagick.resize({
                    srcPath: file.path,
                    dstPath: file.destination+name+"-300x300."+extention,
                    width:   300
                }, function(err, stdout, stderr){
                    if (err) throw err;
                  
                    image300 = name+"-300x300."+extention;

                    var attachment = new Attachments(file);
                    attachment.large = image1024;
                    attachment.thumbnail = image300;
                    attachment.uploaded_by = req.body.uploaded_by;
                    attachment.save(function(err) {
                        if (err) {
                            console.log(_err)
                            return res.send(err);
                        }
                    
                        images.push(attachment._id)
                        callback();
                        
                    });
                });
            });


            /*easyimg.thumbnail({
                src: file.path, 
                dst: file.destination+name+"-1024x1024."+extention,
                width:1024, height:1024,
                x:0, y:0
            }, function(err, image) {
                console.log(err)
                if (err) throw err;
                console.log('Thumbnail created');

                image1024 = image;
                console.log("image1024",image1024);

                easyimg.thumbnail({
                    src: file.path, 
                    dst: file.destination+name+"-318x220."+extention,
                    width:318, height:220,
                    x:0, y:0
                }, function(err, image) {
                    if (err) throw err;
                    console.log('thumbnail created');
                    
                    image318 = image;
                    console.log("image318",image318);

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
                });
            });*/

            /*
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
            */

        }, function(err) {
            if (err) return next(err);
//console.log(images)
            var update = { $pushAll: {images: images } }
            Posts.findOneAndUpdate({_id: req.body.parent}, update, {}, function (err, post, raw) {
                //console.log(err, post, raw)
                if (err) 
                    return res.json({sucess:false, err:err});
                //console.log(post)
                return res.json({sucess:true});
            });

            
        });
    });
    
});