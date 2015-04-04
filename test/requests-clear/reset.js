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
    var query = N1qlQuery.fromString('SELECT * ,META(requests) as meta FROM requests');
    bucket.query(query, function (err, res) {
        if (err) {
            console.log('query failed', err);
            return;
        }
        var stop = process.hrtime(start);
        var count = 0;
        //console.log('success!', res);
        var length = res.length;
        for (var i = 0; i < length; i += 1) {
            // console.log(res[i].meta.id);
            var data = res[i].requests;

            if (res[i].meta.id !== 'request-counter') {
                data.assigned = false;
                bucket.replace(res[i].meta.id, data, function (err, res) {
                    if (err) {
                        console.log('operation failed', err);
                        return;
                    }
                    count++;
                    if (count === length - 1) {
                        process.exit();
                    }
                    //  console.log('success!', res);
                });
            }
        }
        console.log(stop);

    });
});