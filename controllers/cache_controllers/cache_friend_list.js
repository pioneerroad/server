var models = require(__dirname+'/../../models');
var FriendList = models.friend_connection;
var cacheFriendList = models.cache_friend_list;

module.exports = {
    writeCache: function (userId) {
        return FriendList.findAll({
            where: {friend_id: userId}
        }).then(function (result) {
                return cacheFriendList.upsert(result, {where:{userAccountId:userId}}).then(function(data) {
                    return data;
                })
            });
    },
    flushCache: function(userId) {
        return cacheFriendList.destroy({where:{userAccountId:userId}}).then(function(removedData) {
            return removedData;
        })
    }

};
