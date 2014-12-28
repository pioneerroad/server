// app/routes/userProfile.js
// Routes for handling fetch (GET) and update (PUT) of user profile details (eg. username and password)
// Note: 
// GET and PUT routes can be accessed by owner of profile.
// GET routes for full profile to be accessed by owner of profile and friends of owner (need authenticated and authorized user)
// GET routes for limited profile to be accessed by authenticated users

module.exports = function(app, express) {
    var router = express.Router();
    
    router.get('/endpoint', function(req, res) {
        res.json({message:'Something sooooo coool just happened!'});
    });
    
    app.use('/api/v1/user/profile', router);
}