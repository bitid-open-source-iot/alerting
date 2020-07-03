var Q               = require('q');
var dal             = require('../dal/dal');
var auth            = require('../lib/auth');
var notification    = require('../lib/notification');
var ErrorResponse   = require('../lib/error-response').ErrorResponse;

var module = function() {
	var bllAlerts = {
		errorResponse: {
			"error": {
				"code": 	401,
				"message": 	"Alerts Error",
				"errors": [{
					"reason": 		"General Alerts Error",
					"message": 		"Alert Error",
					"locaction": 	"bllAlerts",
					"locationType": "body"
				}]
			},
			"hiddenErrors":[]
		},

        send: (req, res) => {
            var args = {
                'req':      req,
                'res':      res,
                'alerts':   []
            };
            var myModule = dal.module();
            auth.apps.list(args)
            .then(args => args.result.reduce((promise, app) => promise.then(async () => {
                var deferred = Q.defer();

                console.log(1);

                args.req.body.users.map(email => {
                    var alert = {
                        "config": {
                            "push": {
                                "sent":    false,
                                "token":   null,
                                "error":   null,
                                "failed":  false,
                                "enabled": false
                            },
                            "email": {
                                "sent":    false,
                                "error":   null,
                                "failed":  false,
                                "enabled": false
                            },
                            "slack": {
                                "sent":    false,
                                "token":   null,
                                "error":   null,
                                "failed":  false,
                                "channel": null,
                                "enabled": false
                            },
                            "trello": {
                                "sent":    false,
                                "error":   null,
                                "board":   null,
                                "failed":  false,
                                "enabled": false
                            },
                            "webpush": {
                                "sent":    false,
                                "token":   null,
                                "error":   null,
                                "failed":  false,
                                "enabled": false
                            }
                        },
                        "data":     args.req.body.data || {},
                        "email":    email,
                        "title":    args.req.body.title,
                        "appId":    app.appId,
                        "message":  args.req.body.message
                    };
                    if (typeof(args.req.body.push) != "undefined") {
                        alert.config.push.enabled = args.req.body.push.enabled;
                    };
                    if (typeof(args.req.body.email) != "undefined") {
                        alert.config.email.enabled = args.req.body.email.enabled;
                    };
                    if (typeof(args.req.body.slack) != "undefined") {
                        alert.config.slack.token    = args.req.body.slack.token;
                        alert.config.slack.channel  = args.req.body.slack.channel;
                        alert.config.slack.enabled  = args.req.body.slack.enabled;
                    };
                    if (typeof(args.req.body.trello) != "undefined") {
                        alert.config.trello.board   = args.req.body.trello.board;
                        alert.config.trello.enabled = args.req.body.trello.enabled;
                    };
                    if (typeof(args.req.body.webpush) != "undefined") {
                        alert.config.webpush.enabled = args.req.body.webpush.enabled;
                    };
                    args.alerts.push(alert);
                });
        
                deferred.resolve(args);
                
                return deferred.promise;
            }), Q.when(args)), null)
            .then(myModule.tokens.list, null)
            .then(args => args.alerts.reduce((promise, alert) => promise.then(async () => {
                var deferred = Q.defer();
                
                console.log(2);

                args.tokens.map(item => {
                    if (item.appId == alert.appId && item.email == alert.email) {
                        if (item.platform == "browser") {
                            alert.config.webpush.token = item.token;
                        } else if (item.platform == "ios" || item.platform == "android") {
                            alert.config.push.token = item.token;
                        };
                    };
                });
                deferred.resolve(args);
                
                return deferred.promise;
            }), Q.when(args)), null)
            .then(args => args.alerts.reduce((promise, alert) => promise.then(async () => {
                var deferred = Q.defer();

                console.log(3);

                if (alert.config.push.enabled && typeof(alert.config.push.token) != "undefined") {
                    const push = await notification.push(alert.appId, alert.config.push.token, alert.title, alert.message);
                    if (push.ok) {
                        alert.config.push.sent      = true;
                        alert.config.push.failed    = false;
                    } else {
                        alert.config.push.sent      = false;
                        alert.config.push.error     = push.error;
                        alert.config.push.failed    = false;
                    };
                };
                if (alert.config.email.enabled) {
                    const email = await notification.email(alert.email, alert.title, alert.message);
                    if (email.ok) {
                        alert.config.email.sent      = true;
                        alert.config.email.failed    = false;
                    } else {
                        alert.config.email.sent      = false;
                        alert.config.email.error     = email.error;
                        alert.config.email.failed    = false;
                    };
                };
                if (alert.config.slack.enabled && typeof(alert.config.slack.token) != "undefined" && typeof(alert.config.slack.channel) != "undefined") {
                    const slack = await notification.slack(alert.config.slack.token, alert.config.slack.channel, alert.title, alert.message);
                    if (slack.ok) {
                        alert.config.slack.sent      = true;
                        alert.config.slack.failed    = false;
                    } else {
                        alert.config.slack.sent      = false;
                        alert.config.slack.error     = slack.error;
                        alert.config.slack.failed    = false;
                    };
                };
                if (alert.config.trello.enabled && typeof(alert.config.trello.board) != "undefined") {
                    const trello = await notification.trello(alert.config.trello.board, alert.title, alert.message);
                    if (trello.ok) {
                        alert.config.trello.sent      = true;
                        alert.config.trello.failed    = false;
                    } else {
                        alert.config.trello.sent      = false;
                        alert.config.trello.error     = trello.error;
                        alert.config.trello.failed    = false;
                    };
                };
                if (alert.config.webpush.enabled && typeof(alert.config.webpush.token) != "undefined") {
                    const webpush = await notification.webpush(alert.appId, alert.config.webpush.token, alert.title, alert.message);
                    if (webpush.ok) {
                        alert.config.webpush.sent      = true;
                        alert.config.webpush.failed    = false;
                    } else {
                        alert.config.webpush.sent      = false;
                        alert.config.webpush.error     = webpush.error;
                        alert.config.webpush.failed    = false;
                    };
                };

                deferred.resolve(args);
                
                return deferred.promise;
            }), Q.when(args)), null)
            .then(myModule.alerts.write, null)
            .then(args => {
                __responder.success(req, res, args.result);
            }, err => {
                __responder.error(req, res, err);
            });
        },
       
        historical: (req, res) => {
            var args = {
                'req': req,
                'res': res
            };

            var myModule = new dal.module();
            myModule.alerts.historical(args)
            .then(args => {
                __responder.success(req, res, args.result);
            }, err => {
                __responder.error(req, res, err);
            });
        }
	};

	var bllTokens = {
		errorResponse: {
			"error": {
				"code": 	401,
				"message": 	"Tokens Error",
				"errors": [{
					"reason": 		"General Tokens Error",
					"message": 		"Tokens Error",
					"locaction": 	"bllTokens",
					"locationType": "body"
				}]
			},
			"hiddenErrors":[]
		},
      
        register: (req, res) => {
            var args = {
                'req': req,
                'res': res
            };

            var myModule = new dal.module();
            myModule.tokens.register(args)
            .then(args => {
                __responder.success(req, res, args.result);
            }, err => {
                __responder.error(req, res, err);
            });
        },
      
        deregister: (req, res) => {
            var args = {
                'req': req,
                'res': res
            };

            var myModule = new dal.module();
            myModule.tokens.deregister(args)
            .then(args => {
                __responder.success(req, res, args.result);
            }, err => {
                __responder.error(req, res, err);
            });
        }
	};

	return {
        "alerts": 	    bllAlerts,
        "tokens":       bllTokens
	};
};

exports.module = module;