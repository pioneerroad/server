// app/passport.js
// Configure passport strategies for local and Facebook signup/login

var BasicStrategy = require('passport-http').BasicStrategy;

// BEGIN REPLACE
// Replace this with call to MongoDB user model
// Faking database data
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

// Faking method to retrieve data from database
function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

// END REPLACE

module.exports = function(app, passport) {
    
    // ============================================
    // Basic Strategy
    // ============================================
    
    /* Basic Login */
    passport.use('basic-login', new BasicStrategy({
      },
      function(username, password, done) {
        
        process.nextTick(function () {
      
          // Find the user by username.  If there is no user with the given
          // username, or the password is not correct, set the user to `false` to
          // indicate failure.  Otherwise, return the authenticated `user`.
          findByUsername(username, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (user.password != password) { return done(null, false); }
            return done(null, user);
          })
        });
      }
    ));
    
    /* Basic Signup */
    passport.use('basic-signup', new BasicStrategy({   
    },
    function(username, password, done) {
        process.nextTick(function() {
            // Should check if the user exists and if not, then encrypt password and store, then return the stored user
            
            return done(null, {message:'Something cool is going on'}); // Returns err & user
        });
    })); 
}