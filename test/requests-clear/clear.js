//this is test app
//do not use
'use strict'
var couchbase = require("couchbase");
var cluster = new couchbase.Cluster('127.0.0.1:8091');
var N1qlQuery = couchbase.N1qlQuery;

var bucket = cluster.openBucket('requests', function (err) {
    if (err) {
        throw err;
    }

    bucket.enableN1ql(['127.0.0.1:8093']);
    var start = process.hrtime();
    var query = N1qlQuery.fromString('SELECT META(requests) as meta FROM requests');
    bucket.query(query, function (err, res) {
        if (err) {
            console.log('query failed', err);
            return;
        }
        var stop = process.hrtime(start);
        //console.log('success!', res);
        for (var i = 0; i < res.length; i += 1) {
            console.log(res[i].meta.id);
            bucket.remove(res[i].meta.id, function (err, res) {
                if (err) {
                    console.log('operation failed', err);
                    return;
                }

                console.log('success!', res);
            });
        }
        console.log(stop);
        //process.exit();
    });
});