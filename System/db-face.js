//this is test app
//do not use
'use strict'
var Promise = require('bluebird');
var couchbase = require("couchbase");
var cluster = new couchbase.Cluster('127.0.0.1:8091');
var N1qlQuery = couchbase.N1qlQuery;

var bucket = cluster.openBucket('requests', function (err) {
    if (err) {
        throw err;
    }
});

bucket.enableN1ql(['127.0.0.1:8093']);



module.exports.getRequests = function (filter) {
    var strquery = "SELECT *, META(requests) as meta FROM requests WHERE assigned = false";
    if (filter) {
        strquery += " AND type = 'filter'";
    }
    strquery += " ORDER BY timestamp DESC LIMIT 5";
    var p = new Promise(function (resolve, reject) {
        var query = N1qlQuery.fromString(strquery);
        bucket.query(query, function (err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
    return p;
};

module.exports.assignRequest = function (req) {
    var data = req.requests;
    var meta = req.meta;
    console.log('assigning %s to process %s', meta.id, data.assigned);

    var p = new Promise(function (resolve, reject) {

        bucket.get(meta.id,
            function (err, res) {
                if (err) {
                    reject(err);
                    return;
                }
                if (res.value.assigned !== false) {
                    reject('already set');
                }
                resolve(res);
            });
    }).then(function (d) {
        var cas = d.cas;
        var p = new Promise(function (resolve, reject) {
            bucket.replace(meta.id, data, {
                    cas: cas
                },
                function (err, res) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
        });
        return p;
    });
    return p;
};