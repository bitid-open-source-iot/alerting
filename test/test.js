var Q          	= require('q');
var chai        = require('chai');
var fetch		= require('node-fetch');
var expect      = require('chai').expect;
var should     	= require('chai').should();
var config     	= require('./config.json');
var chaiSubset  = require('chai-subset');
chai.use(chaiSubset);

var messageId = null;

describe('Send & Historical', function() {
    it('/alerting/alerts/send', function(done) {
        this.timeout(20000);

        tools.api.alerts.send()
        .then((result) => {
            try {
                result.should.have.property('inserted');
                done();
            } catch(e) {
                done(e);
            };
        }, (err) => {
            try {
                done(err);
            } catch(e) {
                done(e);
            };
        });
    });

    it('/alerting/alerts/historical', function(done) {
        this.timeout(5000);

        tools.api.alerts.historical()
        .then((result) => {
            try {
                result[0].should.have.property('data');
                result[0].should.have.property('date');
                result[0].should.have.property('email');
                result[0].should.have.property('title');
                result[0].should.have.property('appId');
                result[0].should.have.property('config');
                result[0].should.have.property('message');
                result[0].should.have.property('messageId');
                messageId = result[0].messageId;
                done();
            } catch(e) {
                done(e);
            };
        }, (err) => {
            try {
                done(err);
            } catch(e) {
                done(e);
            };
        });
    });

    it('/alerting/alerts/get', function(done) {
        this.timeout(5000);

        tools.api.alerts.get()
        .then((result) => {
            try {
                result.should.have.property('data');
                result.should.have.property('date');
                result.should.have.property('email');
                result.should.have.property('title');
                result.should.have.property('appId');
                result.should.have.property('config');
                result.should.have.property('message');
                result.should.have.property('messageId');
                done();
            } catch(e) {
                done(e);
            };
        }, (err) => {
            try {
                done(err);
            } catch(e) {
                done(e);
            };
        });
    });
});

describe('Health Check', function() {
    it('/', function(done) {
        this.timeout(20000);

        tools.api.healthcheck()
        .then((result) => {
            try {
                result.should.have.property('uptime');
                result.should.have.property('memory');
                result.should.have.property('database');
                done();
            } catch(e) {
                done(e);
            };
        }, (err) => {
            try {
                done(err);
            } catch(e) {
                done(e);
            };
        });
    });
});

var tools = {
    api: {
        alerts: {
            get: () => {
                var deferred = Q.defer();
                
                tools.post('/alerting/alerts/get', {
                    'filter': [
                        'data',
                        'date',
                        'email',
                        'title',
                        'appId',
                        'config',
                        'message',
                        'messageId'
                    ],
                    'messageId': messageId
                })
                .then(deferred.resolve, deferred.resolve);

                return deferred.promise;
            },
            send: () => {
                var deferred = Q.defer();
                
                tools.post('/alerting/alerts/send', {
                    "push": {
                        "enabled":  config.push.enabled
                    },
                    "email": {
                        "enabled":  config.emails.enabled
                    },
                    "slack": {
                        "token":    config.slack.token,
                        "channel":  config.slack.channel,
                        "enabled":  config.slack.enabled
                    },
                    "trello": {
                        "board":    config.trello.board,
                        "enabled":  config.trello.enabled
                    },
                    "webpush": {
                        "enabled":  config.webpush.enabled
                    },
                    "users":    [config.email],
                    "title":    "Test Alert",
                    "appId":    [config.appId],
                    "message":  "Test Message"
                })
                .then(deferred.resolve, deferred.resolve);

                return deferred.promise;
            },
            historical: () => {
                var deferred = Q.defer();
                
                tools.post('/alerting/alerts/historical', {
                    'filter': [
                        'data',
                        'date',
                        'email',
                        'title',
                        'appId',
                        'config',
                        'message',
                        'messageId'
                    ]
                })
                .then(deferred.resolve, deferred.resolve);

                return deferred.promise;
            }
        },
        healthcheck: () => {
            var deferred = Q.defer();
            
            tools.put('/health-check', {})
            .then(deferred.resolve, deferred.resolve);

            return deferred.promise;
        }
    },
    put: async (url, payload) => {
        var deferred = Q.defer();

        payload.header = {
            'email': config.email,
            'appId': config.appId
        };

        payload = JSON.stringify(payload);

        const response = await fetch(config.alerting + url, {
            'headers': {
                'Accept':           '*/*',
                'Content-Type':     'application/json; charset=utf-8',
                'Authorization':    JSON.stringify(config.token),
                'Content-Length':   payload.length
            },
            'body':   payload,
            'method': 'PUT'
        });
        
        const result = await response.json();

        deferred.resolve(result);
        
        return deferred.promise;
    },
    post: async (url, payload) => {
        var deferred = Q.defer();

        payload.header = {
            'email': config.email,
            'appId': config.appId
        };

        payload = JSON.stringify(payload);

        const response = await fetch(config.alerting + url, {
            'headers': {
                'Accept':           '*/*',
                'Content-Type':     'application/json; charset=utf-8',
                'Authorization':    JSON.stringify(config.token),
                'Content-Length':   payload.length
            },
            'body':   payload,
            'method': 'POST'
        });
        
        const result = await response.json();

        deferred.resolve(result);
        
        return deferred.promise;
    }
};