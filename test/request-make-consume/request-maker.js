//this is test app
//do not use
var couchbase = require("couchbase");
var cluster = new couchbase.Cluster('127.0.0.1:8091');

var count = process.argv[2] || 1000;
var inserts_count = 0;
console.log('start', count);

var request = require('./request-template.js');
request.setConst('type', 'test_type1');




var bucket = cluster.openBucket('requests', function (err) {
    if (err) {
        throw err;
    }


    var request_id = 0;
    for (var i = 0; i < count; i += 1) {
        bucket.counter('request-counter', 1, {
            initial: 0
        }, function (err, res) {
            if (err) {
                console.log('operation failed', err);
                return;
            }
            var id_int = parseInt(res.value);
            var request_id = id_int + '::request';

            bucket.insert(request_id, request.getTemplate(), function (err, res) {
                inserts_count += 1;
                console.log('inserted:', inserts_count);
            });
        });
    }

});