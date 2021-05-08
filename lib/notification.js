const Q = require('q');
const fetch = require('node-fetch');
const emails = require('../emails/emails');
const firebase = require('firebase-admin');
const ErrorResponse = require('./error-response');

exports.load = async (args) => {
    var deferred = Q.defer();

    try {
        const url = [__settings.auth.host, '/apps/list'].join('');
        const payload = JSON.stringify({
            'header': {
                'email': __settings.auth.email,
                'appId': __settings.auth.appId
            },
            'filter': [
                'appId',
                'google'
            ]
        });
        const response = await fetch(url, {
            'headers': {
                'Accept': '*/*',
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': JSON.stringify(__settings.auth.token),
                'Content-Length': payload.length
            },
            'body': payload,
            'method': "POST"
        });

        const result = await response.json();

        if (response.ok) {
            if (typeof (result.errors) != "undefined") {
                deferred.reject({
                    "error": result
                });
            } else {
                args.result = result.filter(app => {
                    var valid = true;
                    if (typeof(app.google) != 'undefined' && app.google != null) {
                        if (typeof(app.google.credentials) != 'undefined' && app.google.credentials != null) {
                            if (typeof(app.google.credentials) == 'object') {
                                if (Object.keys(app.google.credentials).length == 0) {
                                    valid = false;
                                }
                            } else {
                                valid = false;
                            };
                        } else {
                            valid = false;
                        };
                        if (typeof(app.google.database) == 'undefined' || app.google.database == null) {
                            valid = false;
                        };
                    } else {
                        valid = false;
                    };
                    return valid;
                });
                deferred.resolve(args);
            };
        } else {
            deferred.reject({
                "error": result
            });
        };
    } catch (error) {
        var err = new ErrorResponse();
        err.error.code = 503;
        err.error.errors[0].code = 503;
        err.error.errors[0].reason = error.message;
        err.error.errors[0].message = "Issue Loading Apps";
        deferred.reject(err);
    };

    return deferred.promise;
};

exports.init = async (args) => {
    var deferred = Q.defer();

    this.load(args)
        .then(args => {
            var deferred = Q.defer();

            try {
                args.result.map(app => {
                    if (typeof (app.google) == "object") {
                        if (typeof (app.google.database) == "string" && typeof (app.google.credentials) == "object" && app.google.database != null && app.google.credentials != null) {
                            firebase.initializeApp({
                                'credential': firebase.credential.cert(app.google.credentials),
                                'databaseURL': app.google.database
                            }, app.appId)
                        };
                    };
                });
                deferred.resolve(args);
            } catch (err) {
                deferred.reject(err.message);
            };

            return deferred.promise;
        }, null)
        .then(args => {
            deferred.resolve(args);
        }, err => {
            deferred.resolve(args);
        });

    return deferred.promise;
};

exports.push = async (appId, token, title, message) => {
    return await firebase.app(appId).messaging().send({
        'notification': {
            'body': message,
            'title': title
        },
        'token': token
    }).then(async result => {
        return {
            'ok': true,
            'result': {}
        };
    }).catch(async error => {
        return {
            'ok': false,
            'error': {
                'code': error.code,
                'message': error.message
            }
        };
    });
};

exports.email = async (email, title, message) => {
    return await emails.alert(email, title, message);
};

exports.slack = async (token, channel, title, message) => {
    const response = await fetch('https://slack.com/api/chat.postMessage?token=' + token + '&channel=' + channel + '&text=' + title + ': ' + message, {
        'headers': {
            'Content-Type': 'application/json; charset=utf-8'
        },
        'method': 'GET',
        'followAllRedirects': true
    });

    const result = await response.json();

    if (!result.ok) {
        return {
            'ok': false,
            'error': {
                'code': 503,
                'message': 'could not send slack'
            }
        };
    } else {
        return {
            'ok': true,
            'result': result
        };
    };
};

exports.trello = async (board, title, message) => {
    return await emails.alert(board, title, message);
};

exports.webpush = async (appId, token, title, message, navigate) => {
    var deferred = Q.defer();

    var payload = {
        'notification': {
            'body': message,
            'title': title
        },
        'webpush': {
            'notification': {
                'body': message,
                'title': title
            }
        },
        'token': token
    };

    if (typeof (navigate) != 'undefined') {
        payload.webpush.notification.click_action = navigate;
    };

    return await firebase.app(appId).messaging().send(payload).then(async result => {
        return {
            'ok': true,
            'result': {}
        };
    }).catch(async error => {
        return {
            'ok': false,
            'error': {
                'code': error.code,
                'message': error.message
            }
        };
    });

    return deferred.promise;
};