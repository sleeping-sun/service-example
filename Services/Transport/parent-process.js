'use strict'
var uuid = require('node-uuid');
var _ = require('lodash');

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
}

var active_defers = [];
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

process.on('message', function (data) {
    //console.log(process.pid, "look what i've got here:", data);
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
});

module.exports = {
    name: 'transport-level-parent-process',
    desc: 'all work with db contained in parent process',
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

        process.send(message);

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

        process.send(message);

        var d = new defer();
        active_defers.push({
            uuid: id,
            defer: d
        });
        return d.promise;
    }

};