var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');

var Promise = require('bluebird');
var uuid = require('uuid');
//var rawSQL = require(__dirname+'/../controllers/rawQueries');
var models = require(__dirname+'/../models');
var queries = require(__dirname+'/../controllers/queries');

module.exports = function(app, userSockets, router) {
    var MessageThreads = app.get('models').message_threads;
    var Messages = app.get('models').messages;
    var UserThreads = app.get('models').message_user_threads;
    var Profile = app.get('models').user_profile;

    var io = app.io;

    router.post('/messages/user/:uid/thread/:threadId/new-message', function(req, res) {
        if (!req.body.message)
            res.status(400).json({error:'MALFORMED_REQUEST'});
        var data = {
                threadId: req.params.threadId,
                senderId: req.params.uid,
                content: req.body.message,
                uuid: uuid.v4(),
                createdAt: Date.now(),
                updatedAt: Date.now()
        };
        var message = Messages.create(data).then(function(data) {
                return data;
            }).error(function(err) {
                return err;
            });

        var activeThread = UserThreads.find({
            where: {
                userAccountId: req.params.uid,
                threadId: req.params.threadId
            },
            raw: true
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });

        var activeSubscribers = UserThreads.findAll({
                where: {
                    threadId: req.params.threadId,
                    status: 'active'
                },
                raw:true
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });

        Promise.all([message, activeSubscribers, activeThread]).spread(function(messageData, activeSubscribersData, activeThreadData) {
            if (activeThreadData === null) {
                res.status(401).json({error:"NOT_A_THREAD_MEMBER"});
                return false;
            }
            var nickName = Profile.findById(messageData.senderId,{raw:true,attributes:['nickName','profilePhoto']}).then(function(data) {
                var message = messageData.dataValues;
                message.senderName = data.nickName;
                pushMessage(message, userSockets, io, activeSubscribersData);
                res.status(200).json({message:messageData});
            })

        });
    });

    router.put('/messages/user/:uid/thread/:threadId/unsubscribe',
    function(req, res) {
        UserThreads.update({
            status: 'inactive'
        },{
            where: {
                threadId: req.params.threadId,
                userAccountId: req.params.uid
            }
        }).then(function(response) {
            res.status(200).json({message:'UNSUBSCRIBED_THREAD'});
        }).error(function(err) {
            res.status(400).json({error:err});
        });
    });

    router.put('/messages/user/:uid/thread/:threadId/update-status',
    function(req, res) {
        UserThreads.update({
            viewDate: Date.now()
        },{
            where: {
                $and: {
                    threadId: req.params.threadId,
                    userAccountId: req.params.uid
                }
            }
        }).then(function(response) {
            console.log(response);
            res.status(200).json(response);
        })
    });

    router.post('/messages/user/:uid/create-thread', function(req, res) {
        if (!req.body.recipients) {
            res.status(400).json({message:'MALFORMED_REQUEST'});
        }
        var data = {
            initUserId: req.params.uid
        };

        MessageThreads.create({
            initUserId: req.params.uid
        }).then(function(data) {
            var values = data.dataValues;
            var recipients = JSON.parse(req.body.recipients);
            recipients.push(req.params.uid);
            for (var i = 0; i < recipients.length; i++) {
                var recipient = recipients[i];
                UserThreads.create({
                    threadId: values.threadId,
                    userAccountId: recipient,
                    status: 'active'
                })
                    .then(function(data) {
                        // Do something
                    })
                    .error(function(err) {
                        res.status(400).json({error:err});
                    })
            }
            res.status(200).json(data);
        }).error(function(err) {
            res.status(400).json(err);
        });
    });

    router.get('/messages/user/:uid/active-threads', function(req, res) {
        models.sequelize.query(queries.listActiveThreads, {replacements: {uid: req.params.uid}})
            .spread(function(data, metadata) {
               res.status(200).json(data);
            })
            .error(function(err) {
                res.status(400).json(err);
            });
    });

    router.get('/messages/user/:uid/thread/:threadId/view-thread', function(req, res) {
        var messages = Messages.findAll({
                where: {
                    threadId: req.params.threadId
                },
                include: [
                    {
                        model:Profile,
                        as:'sender',
                        attributes:['profilePhoto','nickName']
                    }
                ],
                order: [['createdAt','ASC']]
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });

        var validUserThread = UserThreads.findOne(
            {
                where: {
                    $and: {
                        threadId: req.params.threadId,
                        userAccountId: req.params.uid
                    }
                }
        }).then(function(data) {
            return data;
        }).error(function(err) {
            return err;
        });

        Promise.all([validUserThread, messages]).spread(function(userThreadData, messagesData) {
            if (userThreadData !== null) {
                UserThreads.update({viewDate:Date.now()},{
                    where: {
                        userAccountId: req.params.uid,
                        threadId: req.params.threadId
                    }
                }).then(function(data) {
                    res.status(200).json(messagesData);
                }).error(function(error) {
                    res.status(400).json(error);
                });
            } else {
                res.status(400).json({error:"NOT_A_MEMBER_OF_THREAD"})
            }
        });
    });

    return router;
};

function pushMessage(msg, userSockets, io, subscribers) {
    for (var i = 0; i < subscribers.length; i++) { // Get all the active subscribers to this thread
        for (var j = 0; j < userSockets.length; j++) { // Get all active sockets
            if (userSockets[j].userId == subscribers[i].userAccountId) { // If there's an active socket for a thread subscriber
                io.to(userSockets[j].sessionId).emit('new message', msg); // Emit the new message
            }
        }
    }
}
