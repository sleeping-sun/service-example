'use strict'
var Queue = function () {
    var queue = [];
    var subscribers = [];
    var retry_count = 0;
    var retry_max = 3;
    var in_progress = 0;
    var max_in_progress = 10;

    var defaulFunction = function () {
        throw new Error('U should specify function befor');
    };

    return {
        process_function: defaulFunction,
        emitEvent: function (event_name, data) {
            if (!subscribers.hasOwnProperty(event_name)) return;
            var callbacks = subscribers[event_name];

            callbacks.forEach(function (cb) {
                cb.apply(null, data);
            });
        },
        subscribe: function (event_name, callback) {
            if (!subscribers.hasOwnProperty(event_name)) {
                subscribers[event_name] = [];
            }

            subscribers[event_name].push(callback);
        },
        push: function (msg) {

            queue.push(msg);
            this.call_next();
        },
        call_next: function () {
            var is_busy = in_progress >= max_in_progress;
            if (is_busy || !queue.length) return;
            var item = queue.shift();
            in_progress += 1;
            this.try_process(item);
        },
        try_process: function (current) {
            var self = this;
            this.process_function(current)
                .then(function (data) {
                    retry_count = 0;
                    console.log('(%s) Queue said: "processed" in progress %d', process.pid, in_progress);
                    //ack now to free space in rabbitMQ queue
                    current.ack();
                    self.emitEvent('processed', data);
                    in_progress -= 1;
                    self.call_next();
                })
                .catch(function (err) {
                    console.log(err);
                    if (retry_count > retry_max) console.log('Max retry attempts reached');

                    retry_count += 1;
                    console.log('(%s): retry happens', process.pid);
                    self.try_process(current);
                });
        },
        queueLength: function () {
            return queue.length;
        }
    }
};

module.exports = Queue;