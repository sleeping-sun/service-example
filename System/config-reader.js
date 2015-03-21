'use strict'

var config = require('../config');


module.exports.getServiceGroups = function () {
    return config.service_groups;
};

module.exports.getConst = function (name) {
    if (config.hasOwnProperty(name)) {
        return config[name];
    }
    return 'CONST_MISSING';
};