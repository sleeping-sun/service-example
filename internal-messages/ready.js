module.exports.process = function (data, process_id) {
    console.log('(%s) process said that it is ready', process_id);
    var s = data.success;
    var e = data.error;
    console.log('with =>%d<= success and =>%d<= errors', s, e);
    var d = data.description;
    if (d) {
        console.log('description: %s', d);
    }
    return true;
}