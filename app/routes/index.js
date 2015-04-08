var express = require('express');
var router  = express.Router();

router.get('/index', function(req, res) {
    res.json({message:"an index route"});
});

module.exports = router;
