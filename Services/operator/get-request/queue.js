var Queue = function () {
    var queue = [];
    var is_busy = false;
    var current = null;
    var subscribers = [];
    var retry_count = 0;
    var retry_max = 3


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
            this.try_process();
        },
        try_process: function (retry) {
            retry = retry || false;
            if ((is_busy || !queue.length) && !retry) return;

            is_busy = true;

            current = retry ? current : queue.shift();

            var self = this;

            this.process_function(this.current)
                .then(function (data) {
                    retry_count = 0;
                    console.log('(%s) Queue said: "processed"', process.pid);
                    //ack now to free space in rabbitMQ queue
                    current.ack();
                    self.emitEvent('processed', data);
                    is_busy = false;
                    self.try_process();
                })
                .catch(function () {
                    if (retry_count > retry_max) console.log('Max retry attempts reached');

                    retry_count += 1;
                    console.log('(%s): retry happens', process.pid);
                    self.try_process(true);
                });
        },
        queueLength: function () {
            return queue.length;
        }
    }
};

module.exports = Queue;