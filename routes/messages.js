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
    var UserThreads = app.get('models').message_user_threads;
    var Profile = app.get('models').user_profile;

    var io = app.io;

    /** Create a new message thread */
    /** Need to pass in an array of users who participate in this thread */
    router.post('/message/user/:uid/new-thread', function(req, res) {
        if (!req.body.recipients || !req.body.content)
            res.status(400).json({error:"MALFORMED_REQUEST"});
        var userArray = JSON.parse(req.body.recipients);
        userArray.push(req.params.uid); // Add originator's id to the thread
        var msgContent = req.body.content;
        var msg = { // Build msg object
            initUserId: req.params.uid,
            threadContent: [{
                userId: req.params.uid,
                message: msgContent,
                timestamp: Date.now(),
                uuid: uuid.v4(),
                location: {
                    lat: req.body.lat,
                    lon: req.body.lon
                }
            }]
        };

        MessageThreads.create(msg).then(function(data, metadata) {
            for (var i=0; i < userArray.length; i++) { // Iterate user array and save each one with the new thread ID
                var msgUserThread = {
                    userAccountId: userArray[i],
                    threadId: data.threadId
                }
                var userThread = UserThreads.create(msgUserThread).then(function(data, metadata) {
                    return data;
                }).error(function(err) {
                    return err;
                });
            }
            res.status(200).json({message:data});
        }).error(function(err) {
            res.status(400).json({error:err});
        });
    });

    /** Append a message to an existing thread -- get existing thread, then add new data to end and send back.*/
    /** Need to support transactions/table locking for this */
    /** Need to check that the user posting the message is included on the thread */
    router.put('/message/user/:uid/thread/:threadId/new-message',
        function(req, res) {
            if (!req.body.content)
                res.status(400).json({error:"MALFORMED_REQUEST"});

            var thread = MessageThreads.findById(req.params.threadId, {raw:true}).then(function(data) {
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

            var subscribers = UserThreads.findAll({
                where: {
                    threadId: req.params.threadId,
                    status: 'active'
                },
                raw: true
            }).then(function(data) {
                return data;
            }).error(function(err) {
                return err;
            });

            Promise.all([thread, activeThread, subscribers]).spread(function(threadData, activeThreadData, subscribersData) {
                if (activeThreadData === null) {
                    res.status(401).json({error:"NOT_A_THREAD_MEMBER"});
                    return false;
                }
                var msgContent = threadData.threadContent;
                var newMsg = {
                    userId: req.params.uid,
                    message: req.body.content,
                    location: {
                        lat: '',
                        lon: ''
                    },
                    timestamp: Date.now(),
                    uuid: uuid.v4()
                };
                msgContent.push(newMsg); // Append the new message to the existing thread array

                pushMessage(newMsg, userSockets, io, subscribersData); // Push the new message via active socket.io

                MessageThreads.update( // Update the msg thread with newly appended message.
                    {
                        threadContent: msgContent
                    }, {
                        where: {
                            threadId: req.params.threadId
                        },
                        returning: true,
                        limit: 1
                    }).spread(function(metadata, data) {
                        res.status(200).json(newMsg);
                    }).catch(function(err) {
                        res.status(400).json({error:'Message sending failed'});
                    });
            });
    });

    /** Get list of active threads for current user */
    /** Need to compare thread view date (for this user) with thread last message date to see if there are unread messages for this user*/

    router.get('/message/user/:uid/active-threads', function(req, res) {
        models.sequelize.query(queries.listActiveThreads, {
            replacements: {
                uid: req.params.uid
            }})
            .spread(function(data, metadata) {
                res.json(data);
            })
            .error(function(error) {
                res.json(error);
            })
    });

    /** Need to check user is active on requested thread and update their read status*/
    router.get('/message/user/:uid/thread/:threadId/read-thread',
        function(req, res) {

            var data = {
                viewDate: Date.now()
            };

           var messages = MessageThreads.findOne({
               where: {threadId: req.params.threadId},
               attributes: ['threadContent'],
               raw: true
           }).then(function(data) {
                    return data;
                }).error(function(err) {
                    return(data);
                });

            var updateUser = UserThreads.update(
                {
                    viewDate: Date.now()
                },{
                    where: {
                        userAccountId: req.params.uid,
                        $and: {threadId: req.params.threadId}}
                }).then(function(data) {
                    return data;
                }).error(function(err) {
                    return err;
                });

            Promise.all([messages, updateUser]).spread(function(messageData, updateUser) {
                res.status(200).json(messageData);
            });
    });

    router.put('/message/user/:uid/thread/:threadId/unsubscribe', function(req, res) {
        UserThreads.update(
            {status:'inactive'},
            {where: {
                userAccountId: req.params.uid,
                $and: {threadId: req.params.threadId}
            }
        }).then(function(data) {
            res.status(200).json({message:'Updated '+data+' rows'});
        }).error(function(err) {
            res.status(400).json({error:err})
        })
    })

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
