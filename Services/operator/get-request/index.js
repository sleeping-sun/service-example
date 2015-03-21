'use sctrict'


var amqp = require('../../../System/amqp.js');
var Promise = require('bluebird');
var coordinator = require('./coordinator');
var db_face = require('../../../System/db-face.js');
var pid = process.pid;

console.log('(%d) Get-Request Service Reporting', pid);

//@TODO: use arrow function in callback
amqp.subscribe('operator_events', function (msg) {
    if (msg !== null) {
        var message = JSON.parse(msg.content.toString());
        console.log('%d recieved event: %s || filters: %s', pid, message.event, message.filter ? 'message.filter' : 'all');
        msg.ack();
        db_face.getRequests(message.filter).then(function (d) {
            var result = d[0];
            result.requests.assigned = pid;
            return db_face.assignRequest(result);
        }).then(function (d) {
            console.log('s:', d);
        }).catch(function (e) {
            console.log('Error:', e)
        });
    }
}).then(function () {
    console.log('subscribed');
});

//process.send('wololo');