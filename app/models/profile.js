// @file profile.js

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var ProfileSchema = mongoose.Schema({
    basic                   : {
        fullName            : {type: String}, // Display name for profile eg. John and Jane Citizen
        profilePhoto        : {type: String}, // URI of stored profile photo
        homeTown            : {type: String}, // Unique ID of place from town/place database 
        currentLocation     : {
            lat             : {type: String},
            lon             : {type: String}
        }
    },
    vehicle                 : {
        photo               : {type: String}, // URI of stored photo
        type                : {type: String}, // Caravan, campervan, motorhome
        make                : {type: String}, // Manufacture
        model               : {type: String}, // Model of vehicle
        year                : {type: String}, // Eg. 2013
        chassis             : {               // If applicable (for motorhomes/campervans)
            make            : {type: String}, // Eg. Toyota
            model           : {type: String}, // Eg. Hilux
            engine          : {type: String}, // Eg. 2L Diesel
            drive           : {type: String}, // Eg. 4WD
            transmission    : {type: String}, // Eg. 5 Speed Manual
        }
    },
    travelStats             : {
        distanceTravelled   : {
            lastMonth       : {type: Number},
            thisYear        : {type: Number},
            allTime         : {type: Number}
        },
        tripDuration        : { // Number of nights spent on the road
            lastMonth       : {type: Number},
            thisYear        : {type: Number},
            allTime         : {type: Number}
        },
        summaries           : {
            avgTripDuration : {type: Number}, //Number of days
            avgTripDistance : {type: Number}, 
            avgStayDuration : {type: Number}, // Avg number of nights stay in one place
            avgDistanceDay  : {type: Number}, //
        }          
    },
    extended                : {
        favTown             : {type: String},
        favSnack            : {type: String},
        reasonForTravel     : {type: String}  // Why does user like to travel
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Profile', ProfileSchema);