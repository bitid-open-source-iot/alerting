const moment = require('moment');

class Time {

    constructor(value) {
        if (typeof(value) == 'undefined' || value == null) {
            value = moment().format('HH:mm:ss.SSS');
        };
        var date = new Date();
            date = [date.getFullYear(), '/', date.getMonth() + 1, '/', date.getDate(), ' ', value].join('');
        this.value = moment(new Date(date)).format('HH:mm:ss:SSS');
    };

    getHours(overwrite) {
        var value = Math.floor(this.value.split(':')[0]);
        if (value == 0 && overwrite) {
            value = overwrite;
        };
        return value;
    };

    getMinutes(overwrite) {
        var value = Math.floor(this.value.split(':')[1]);
        if (value == 0 && overwrite) {
            value = overwrite;
        };
        return value;
    };

    getSeconds(overwrite) {
        var value = Math.floor(this.value.split(':')[2]);
        if (value == 0 && overwrite) {
            value = overwrite;
        };
        return value;
    };

    getMilliseconds(overwrite) {
        var value = Math.floor(this.value.split(':')[3]);
        if (value == 0 && overwrite) {
            value = overwrite;
        };
        return value;
    };

};

module.exports = Time;