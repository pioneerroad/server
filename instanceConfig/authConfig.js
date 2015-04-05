// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1537948646461807', // your App ID
        'clientSecret'  : '8df660c767f219d09b20f325e346b36b', // your App Secret
        'callbackURL'   : 'https://localhost:8090/user/facebook/auth/callback/'
    }
};