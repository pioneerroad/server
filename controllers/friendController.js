var models = require(__dirname+'/../models');
var Friend = models.friend_connection;

module.exports = function(friendId, friendedId) {

    this.friendId = friendId;
    this.friendedId = friendedId;

    this.initiateFriendRequest = function() {
        if (friendId == friendedId) {
            return {error:'CANNOT_BE_FRIENDS_WITH_YOURSELF'}
        }
        return Friend.findAll({where: {
            $or : [{
                $and: {
                    friend_id: friendId,
                    friended_id: friendedId}},
                {
                    $and: {
                        friended_id: friendId,
                        friend_id: friendedId
                    }}]}
        }).then(function(data) {
            if (data.length == 0) {
                return Friend.create({
                    friend_id: friendId,
                    friended_id: friendedId,
                }).then(function(response) {
                    return Friend.create({
                        friended_id: friendId,
                        friend_id: friendedId
                    }).then(function(response) {
                        return response;
                    })
                }).error(function(err) {
                    return err;
                });
            } else {
                return {error:'FRIENDSHIP_EXISTS'};
            }
        });
    }

    this.acceptFriendRequest = function() {
        return Friend.update({status:'active'},{where: {
            $or : [{
                $and: {
                    friend_id: this.friendId,
                    friended_id: this.friendedId,
                    status: 'request'}},
                {
                    $and: {
                        friended_id: this.friendId,
                        friend_id: this.friendedId,
                        status: 'request'
                    }}]}
        }).then(function(response) {
            return {response: 'Updated '+response+' rows'};
        });
    }

    this.updateFriendRequest = function() {
        return {message:'Updated'};
    }
}




/*module.exports = {
    initiateFriendRequest: function(friendId) {

    },
    acceptFriendRequest: function(friendId, friendedId) {
        return Friend.findAll({where: {
            $or : [{
                $and: {
                    friend_id: friendId,
                    friended_id: friendedId}},
                {
                    $and: {
                        friended_id: friendId,
                        friend_id: friendedId
                    }}]}
        }).then(function(response) {
            return response;
        })
    },
    updateFriendStatus: function(friendId, friendedId, newStatus) {

    }
}*/
