var Promise = require('bluebird');

var getMessage = function (type) {
    return message = require('./internal-messages/' + type + '.js');
};

var messageHandler = function (process_id, child_process) {
    return function (message) {
        if (typeof message === 'object' && message.hasOwnProperty('type')) {
            var type = message.type;
            var message_obj = getMessage(type);

            return Promise.resolve(message_obj.process(message.body, process_id)).then(function (data) {
                if (typeof data === 'object' && data.hasOwnProperty('type')) {
                    if (data.type === 'query_result') {
                        child_process.send(data);
                    }
                }
            });
        }
        return Promise.resolve(true);
    };
};

module.exports = messageHandler;