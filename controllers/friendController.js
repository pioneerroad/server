var models = require(__dirname+'/../models');
var Friend = models.relationship_friends;
var Profile = models.user_profile;
var User = models.user_account;
var Query = require(__dirname+'/queries');

module.exports = function(friendA, friendB) {

    this.createFriendRequest = function(friendA, friendB, metaData) {
        if (friendA != friendB) {
            return Friend.create({
                friendA: parseInt(friendA),
                friendB: parseInt(friendB),
                initiator: parseInt(friendA),
                recipient: parseInt(friendB),
                metaData: metaData
            }).then(function(data) {
                return data.dataValues;
            }).error(function(err) {
                return {error:err};
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
        return models.sequelize.query(Query.pendingFriendRequests, {replacements: {uid: uid}, raw:true})
            .spread(function(results, metadata) {
                return results;
            })
            .error(function(err) {
                return err;
            });
    };

    this.blockFriend = function(friendA, friendB) {
        return Friend.update({
            status: 'blocked',
            lastStatusUpdateBy: friendA
        }, {
            where: {
                $or: [
                    {$and: {userA: friendA, userB: friendB}},
                    {$and: {userA: friendB, userB: friendA}}
                ]
            }
        }).spread(function(data, metadata) {
            return data;
        }).error(function(err) {
            return err;
        });
    }

    this.unblockFriend = function(friendA, friendB) {
        return Friend.update({
            status: 'active',
            lastStatusUpdateBy: friendA
        }, {
            where: {
                $and: {status: 'blocked'},
                $or: [
                    {$and: {lastStatusUpdateBy: friendA, userB: friendA}},
                    {$and: {lastStatusUpdateBy: friendA, userB: friendB}}
                ]
            }
        }).spread(function(data, metadata) {
            return data;
        }).error(function(err) {
            return err;
        });
    }

    this.findFriend = function(string) {
        return models.sequelize.query(Query.memberFinder, {replacements:{string:string}})
            .spread(function(results, metadata) {
                return results;
            })
            .error(function(err) {
                return err;
            })
    }

    this.listActiveFriends = function(uid) {
        return models.sequelize.query(Query.activeFriends, {replacements: {uid: uid}})
            .spread(function(results, metadata) {
                return results;
            })
            .error(function(err) {
                return err;
            });
    }

    this.friendsNearby = function(uid) {
        return models.sequelize.query(Query.friendsNearby, {replacements: {uid: uid, distance: 50}})
            .spread(function(results, metadata) {
                return results;
            })
            .error(function(err) {
                return err;
            });
    }
}
