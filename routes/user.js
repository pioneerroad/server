var models = require(__dirname + '/../models');
var express = require('express');
var router  = express.Router();

router.post('/user/create', function(req, res) {
    models.User.create({
        username: req.body.username,
        password: req.body.password,
    }).then(function() {
        res.json({message:"Created a user"});
    });
});
/**
 * TEST ONLY*/
router.get('/user', function(req, res) {
    res.json({message:"a user route"});
});

module.exports = router;
