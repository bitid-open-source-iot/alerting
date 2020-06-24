var Q          	= require('q');
var chai        = require('chai');
var fetch		= require('node-fetch');
var expect      = require('chai').expect;
var should     	= require('chai').should();
var config     	= require('./config.json');
var chaiSubset  = require('chai-subset');
chai.use(chaiSubset);

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
                        'message'
                    ]
                })
                .then(deferred.resolve, deferred.resolve);

                return deferred.promise;
            }
        }
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