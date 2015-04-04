'use sctrict'
var Promise = require('bluebird');
var open = Promise.resolve(require('amqplib').connect('amqp://localhost'));
var q = 'operator_events';

var count = process.argv[2] || 100;
console.log('Emiting %d operator events', count);
open.then(function (conn) {
    var ok = conn.createChannel();
    ok = ok.then(function (ch) {
        ch.assertQueue(q);
        var message = {
            filter: false,
            event: 'call_next',
            timestamp: (new Date()).getTime()

        };
        for (var i = 0; i < count; i += 1) {
            ch.sendToQueue(q, new Buffer(JSON.stringify(message)));
        }
        process.on('SIGINT', function () {
            ch.close();
            conn.close();
            process.exit();
        });

    });
    return ok;
}).catch(console.warn);