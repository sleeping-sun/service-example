'use sctrict'

var amqp = require('../../System/amqp.js');
var open = amqp.open;
var Promise = require('bluebird');
var db_face = require('../../System/db-face.js');

var queue_name = 'db_queue';

var callback = function (pid) {
    var id = pid;
    var chanel_name = 'db_answers_for_' + id;

    var fn = open.then(function (conn) {
        var ok = conn.createChannel()
            .then(function (ch) {
                ch.assertQueue(chanel_name);

                var f = function (message) {
                    console.log('sent to', chanel_name);
                    ch.sendToQueue(chanel_name, new Buffer(JSON.stringify(message)));
                }
                return f;
            });
        return ok;
    }).catch(console.warn);

    var sendToRabbit = function (message) {
        fn.then(function (f) {
            f(message);
        });
    };

    return function (msg) {
        if (msg !== null) {
            var data = JSON.parse(msg.content.toString()).body;
            msg.ack();
            if (db_face.hasOwnProperty(data.fname)) {
                var uuid = data.uuid;
                db_face[data.fname].call(db_face, data.params).then(function (rows) {
                    var data = {};
                    data.type = 'query_result';
                    data.uuid = uuid;
                    data.body = rows;
                    return data;
                }).catch(function () {
                    var data = {};
                    data.type = 'query_result';
                    data.uuid = uuid;
                    data.body = 'error';
                    return data;
                }).then(function (data) {
                    sendToRabbit(data);
                });
            }
        }
    }
};


amqp.subscribe(queue_name, function (msg) {
    if (msg !== null) {
        var message = JSON.parse(msg.content.toString());
        console.log(message);
        var pid = message.pid;
        var dynamic_queue = 'db_requests_for_' + pid;
        var f = new callback(pid);
        amqp.subscribe(dynamic_queue, f);
        msg.ack();
    }
}).then(function () {
    console.log('(%d) Subscribed on %s', process.pid, queue_name);
});