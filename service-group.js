'use strict'
var services_pool = {};
var actions = {
    init: function (message_body) {
        console.log('Initialization %s', message_body.name);
        var services = message_body.services;
        var error = 0;
        var success = 0;
        for (var i = 0; i < services.length; i += 1) {
            console.log('Starting service "%s"', services[i]);
            //awoiding duplication
            if (services_pool.hasOwnProperty(services[i])) {
                //TODO: Error object here
                console.warn('%s : "%s"  already running!', message_body.name, services[i]);
                error += 1;
                continue;
            }

            try {
                services_pool[services[i]] = require('./Services/' + services[i]);
                success += 1;
            } catch (e) {
                error += 1;
                if (e instanceof Error && e.code === "MODULE_NOT_FOUND")
                //TODO: Error object here
                    console.warn('%s : Can\'t load "%s"!', message_body.name, services[i]);
                else
                    throw e;
            }
        }

        var message = {
            type: 'ready',
            body: {
                success: success,
                error: error
            }
        };
        process.send(message);
    }
};

process.on('message', function (message) {
    if (message.hasOwnProperty('type') && actions.hasOwnProperty(message['type'])) {
        var action_type = message['type'];
        actions[action_type].call(null, message.body);
    }
});