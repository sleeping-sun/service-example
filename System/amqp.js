'use sctrict'
var Promise = require('bluebird');
var open = Promise.resolve(require('amqplib').connect('amqp://localhost'));


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

module.exports.open = open;