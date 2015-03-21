'use sctrict'
var Promise = require('bluebird');
var open = Promise.resolve(require('amqplib').connect('amqp://localhost'));
var q = 'task';

// Publisher
/*
open.then(function (conn) {
    var ok = conn.createChannel();
    ok = ok.then(function (ch) {
        ch.assertQueue(q);
        ch.sendToQueue(q, new Buffer('something to do'));
    });
    return ok;
}).catch(console.warn);
*/

// Consumer


module.exports.subscribe = function (queue_name, callback) {
    return open.then(function (conn) {
        return conn.createChannel().then(function (ch) {
            ch.assertQueue(queue_name);
            ch.consume(queue_name, function (msg) {

                msg.ack = function () {
                    ch.ack(this);
                };
                callback(msg);
            });
        });
    }).catch(console.warn);
};