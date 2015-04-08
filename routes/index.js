var express = require('express');
var router  = express.Router();
var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var jwtToken = require(__dirname+'/../controllers/jwtGenerate');

router.post('/index', [jwtAuth], function(req, res) {
    if (jwtAuth.isAuthenticated(req, res)) {
        res.json({message:"Is authenticated"});
    };
});

module.exports = router;
