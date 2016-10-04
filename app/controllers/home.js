var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    return res.render('index', {
        title: "WHIMSY",
        categories: [
            {
                name: "CROISIÈRES",
                url: "/c/croisieres"
            }, 
            {
                name: "TECHNIQUE",
                url: "/c/technique"
            },
            {
                name: "CONVOYAGES",
                url: "/c/convoyages"
            },
            {
                name: "REPÉRAGES",
                url: "/c/reperages"
            },
        ],
    });
});