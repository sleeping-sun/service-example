var db_face = require('../../System/db-face.js');

module.exports = {
    name: 'transport-level-internal',
    desc: 'each service opens own connetcion to bucket',
    db_action: function (action, params) {
        return this[action].call(this, params);
    },
    execute: function (params) {
        console.log('Test method executed by %s process', params.pid);
    },
    getRequests: function (params) {
        var filter = params.filter;

        return db_face.getRequests(filter);
    },
    assignRequest: function (req) {
        return db_face.assignRequest(req)
    }

};