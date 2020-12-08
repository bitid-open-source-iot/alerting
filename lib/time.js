const moment = require('moment');

class Time {

    constructor(value) {
        if (typeof(value) == 'undefined' || value == null) {
            value = moment().format('HH:mm:ss.SSS');
        };
        var date = new Date();
            date = [date.getFullYear(), '/', date.getMonth() + 1, '/', date.getDate(), ' ', value].join('');
        this.value = moment(date).format('HH:mm:ss:SSS');
    };

    getHours() {
        return Math.floor(this.value.split(':')[0]);
    };

    getMinutes() {
        return Math.floor(this.value.split(':')[1]);
    };

    getSeconds() {
        return Math.floor(this.value.split(':')[2]);
    };

    getMilliseconds() {
        return Math.floor(this.value.split(':')[3]);
    };

};

module.exports = Time;