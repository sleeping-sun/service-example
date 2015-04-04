'use strict'

var template = require('./template.js');
var constants = {};
var placeholders = {
    timestamp: function () {
        var d = new Date();
        return d.getTime();
    },
    type: function () {
        return getConst('type');
    },
    default: function () {
        return 'PLACEHOLDER_MISSING';
    },
    rnd: function () {
        return parseInt(Math.random() * 7);
    }
};

var getConst = function (name) {

    return constants[name] || 'CONST_MISSING';
};

var getPlaceholder = function (ph) {
    var ph_name = ph.substring(1).slice(0, -1);
    if (!placeholders.hasOwnProperty(ph_name)) {
        ph_name = 'default';
    }
    return placeholders[ph_name].call();
};

module.exports = {
    getTemplate: function () {
        var result = {};
        for (var key in template) {
            if (template.hasOwnProperty(key)) {
                var s = template[key];
                var match = null;
                if (typeof s === "string") {
                    match = s.match(/%\w+%/g);
                }

                if (match !== null) {
                    for (var j = 0; j < match.length; j += 1) {
                        var ph = getPlaceholder(match[j]);
                        s = s.replace(match[j], ph);
                    }
                }
                result[key] = s;
            }
        }

        return result;
    },
    setConst: function (name, value) {
        constants[name] = value;
        return true;
    }
};