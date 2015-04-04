'use strict'
var child_process = require('child_process');

var config = require('./System/config-reader');
var messageHandler = require('./message-handler.js');

var spawn_limit = config.getConst('spawn_limit');
var groups_config = config.getServiceGroups();

var spawned_groups = [];

var spawn = function (groups_config) {
    var groups_count = groups_config.length;
    if (groups_count > spawn_limit) {
        //throw error object here
        console.warn('Spawn limit reached!');
    }
    console.log('Preprae to spawn %d processes', groups_count);
    for (var i = 0; i < groups_count; i += 1) {
        console.log('Spawning %s', groups_config[i].name);

        spawned_groups[i] = child_process.fork('./service-group.js');
        var message = {
            type: 'init',
            body: groups_config[i]
        };
        spawned_groups[i].send(message);
        spawned_groups[i].on('message', new messageHandler(i, spawned_groups[i]));
    }
};

spawn(groups_config);