var Promise = require('bluebird');
var amqp = require('../../System/amqp.js');
var _ = require('lodash');
var uuid = require('node-uuid');

var open = amqp.open;
var active_defers = [];

function defer() {
    var resolve, reject;
    var promise = new Promise(function () {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
};

var chanel_name = 'db_requests_for_' + process.pid;

var getDefer = function (searched_uuid) {
    var result = 0;
    var index = _.findIndex(active_defers, function (item) {
        return item.uuid === searched_uuid;
    });
    result = active_defers[index].defer;
    return result;
};

var deleteDefer = function (searched_uuid) {
    var index = _.findIndex(active_defers, function (item) {
        return item.uuid === searched_uuid;
    });

    active_defers.splice(index, 1);
};

var fn = open.then(function (conn) {
    var ok = conn.createChannel()
        .then(function (ch) {
            ch.assertQueue(chanel_name);

            var f = function (message) {
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

var ans_chanel_name = 'db_answers_for_' + process.pid;

amqp.subscribe(ans_chanel_name, function (msg) {
    var data = JSON.parse(msg.content.toString());
    if (data.hasOwnProperty('type') && data.type === 'query_result') {
        var id = data.uuid;
        var active_defer = getDefer(id);
        if (data.body !== 'error') {
            active_defer.resolve(data.body);
        } else {
            active_defer.reject('some error');
        }
        deleteDefer(id);
    }
    msg.ack();
}).then(function (arguments) {
    console.log(ans_chanel_name);
});

module.exports = {
    name: 'transport-level-message-based',
    desc: 'all work with db contained in externall process controlled via RabbitMQ',
    db_action: function (action, params) {
        return this[action].call(this, params);
    },
    execute: function (params) {
        console.log('Test method executed by %s process', params.pid);
    },
    getRequests: function (params) {
        var message = {};
        message.type = 'db_action';
        var id = uuid.v1();

        message.body = {
            fname: 'getRequests',
            params: '',
            uuid: id
        };

        sendToRabbit(message);

        var d = new defer();
        active_defers.push({
            uuid: id,
            defer: d
        });
        return d.promise;
    },
    assignRequest: function (req) {
        var message = {};
        message.type = 'db_action';
        var id = uuid.v1();

        message.body = {
            fname: 'assignRequest',
            params: req,
            uuid: id
        };

        sendToRabbit(message);

        var d = new defer();
        active_defers.push({
            uuid: id,
            defer: d
        });
        return d.promise;
    }

};

//send init message to queue
var q = 'db_queue';

open.then(function (conn) {
    var ok = conn.createChannel();
    ok = ok.then(function (ch) {
        ch.assertQueue(q);
        var message = {
            pid: process.pid
        };
        ch.sendToQueue(q, new Buffer(JSON.stringify(message)));
    });
    return ok;
}).catch(console.warn);