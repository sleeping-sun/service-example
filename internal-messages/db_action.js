var Promise = require('bluebird');
var db_face = require('../System/db-face.js');

module.exports.process = function (data, process_id) {
    if (db_face.hasOwnProperty(data.fname)) {
        var uuid = data.uuid;
        return db_face[data.fname].call(db_face, data.params).then(function (rows) {
            var data = {};
            data.type = 'query_result';
            data.uuid = uuid;
            data.body = rows;
            return data;
        }).catch(function (err) {
            var data = {};
            data.type = 'query_result';
            data.uuid = uuid;
            data.body = 'error';
            console.log(err);
            return data;
        });
    } else {
        return Promise.reject('no such function');
    }
}