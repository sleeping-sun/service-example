'use sctrict'

var amqp = require('../../../System/amqp.js');
var Promise = require('bluebird');
//var Queue = require('./queue.js');
var Queue = require('./async-queue.js');

var transport = require('../../Transport/transport-level.js')('internal');
//var transport = require('../../Transport/transport-level.js')('parent-process');
//var transport = require('../../Transport/transport-level.js')('message-based');

var pid = process.pid;
var queue_name = 'operator_events';

console.log('(%d) Get-Request Service Reporting', pid);

var process_queue = new Queue();

//time mark
var start = 0;

process_queue.process_function = function () {
    return transport.db_action('getRequests', {
        filter: null
    }).then(function (d) {
        var req = d[0];
        req.requests.assigned = pid;
        return transport.db_action('assignRequest', req);
    });
};


process_queue.subscribe('processed', function (data) {
    console.log('(%d): In queue %d', pid, process_queue.queueLength());
    // set time mark when queue empty
    if (process_queue.queueLength() === 0) {
        var end = process.hrtime(start);
        console.log(end);
    }
});

//@TODO: use arrow function in callback... someday...
amqp.subscribe(queue_name, function (msg) {
    if (msg !== null) {
        var message = JSON.parse(msg.content.toString());
        console.log('(%d) received event: %s || filters: %s', pid, message.event, message.filter ? 'message.filter' : 'all');
        //set time mark when first message received
        if (!start) {
            start = process.hrtime();
        }

        process_queue.push(msg);
    }
}).then(function () {
    console.log('(%d) Subscribed on %s', pid, queue_name);
});