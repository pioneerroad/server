// app/routes/userAccount.js
// Routes for handling fetch (GET) and update (PUT) of user account details (eg. username and password)
// Note: Only accessible by user who owns user profile, so need an authenticated user and user details (eg. username) extracted from token

module.exports = function(app, express) {
    var router = express.Router();
    
    app.use('/api/v1/user/account', router);
}