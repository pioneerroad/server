var models = require(__dirname+'/../models');
var Friend = models.relationship_friends;
var Profile = models.user_profile;
var User = models.user_account;

module.exports = function(friendA, friendB) {

    this.initiateFriendRequest = function(friendA, friendB, metaData) {
        if (typeof(placeId) !== 'number') {
            placeId = null;
        }

        var orderedPair = createOrderedPair(friendA, friendB);
        if (orderedPair) {
            return Friend.create({
                friendA: orderedPair[0],
                friendB: orderedPair[1],
                initiator: parseInt(friendA),
                recipient: parseInt(friendB),
                metaData: metaData
            }).then(function(data) {
                return data;
            }).error(function(err) {
                return err;
            });
        } else {
            return {error:'INCORRECT_PARAMETERS'};
        }
    };

    this.acceptFriendRequest = function(friendA, requestId) {
        return Friend.update({
            status: 'active',
            lastStatusUpdateBy: friendA
        }, {
            where: {
                id: requestId,
                status: 'pending',
                recipient: friendA
            }
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });
    };

    this.ignoreFriendRequest = function(friendA, requestId) {
        return Friend.update({
            status: 'ignore',
            lastStatusUpdateBy: friendA
        }, {
            where: {
                id: requestId,
                status: 'pending',
                recipient: friendA
            }
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });
    }

    this.pendingFriendList = function(uid) {
        return Friend.findAll({
            where: {
                $and: {
                    status: 'pending',
                    $or: [
                        {friendA: uid},
                        {friendB: uid}
                    ]}
            },
            include: [{
                model: User,
                where: { friendA: models.sequelize.col('user_account.id')}
            }]
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });
    };

    this.blockFriend = function(friendA, friendB) {
        var orderedPair = createOrderedPair(friendA, friendB);

        return Friend.update({
            status: 'blocked',
            lastStatusUpdateBy: friendA
        }, {
            where: {
                friendA: orderedPair[0],
                friendB: orderedPair[1]
            }
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });
    }

    this.unblockFriend = function(friendA, friendB) {
        var orderedPair = createOrderedPair(friendA, friendB);

        return Friend.update({
            status: 'active',
            lastStatusUpdateBy: friendA
        }, {
            where: {
                friendA: orderedPair[0],
                friendB: orderedPair[1],
                status: 'blocked',
                lastStatusUpdateBy: friendA // Only the person who created the block should be able to clear it
            }
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });
    }

    this.findFriend = function(username) {
        return User.findOne({
            where: {
                username : username
            }, attributes: ['id']}
        ).then(function(data) {
            if (data) {
                return data;
            } else {
                return {error: 'NO_MATCHING_USER'}
            }
        }).error(function(err) {
            return err;
        })
    }

}

function createOrderedPair(friendA, friendB) {
    if (friendA == friendB) {
        return false;
    }
    var unorderedPair = [friendA, friendB];
    var orderedPair = unorderedPair.sort(function(a,b){return a - b;});
    return orderedPair;
}
