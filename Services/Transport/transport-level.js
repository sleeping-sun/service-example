'use strict'

module.exports = function (type) {
    return require('./' + type + '.js');
};