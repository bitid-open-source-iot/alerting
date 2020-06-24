var Q       	= require('q');
var db			= require('../db/mongo');
var ObjectId 	= require('mongodb').ObjectId;

var module = function() {
	var dalAlerts = {
		errorResponse: {
			"error": {
				"code": 	401,
				"message": 	"Invalid Credentials",
				"errors":[{
					"reason": 		"General Alerts Error",
					"message": 		"Invalid Credentials",
					"locaction": 	"dalAlerts",
					"locationType": "header",
				}]
			},
			"hiddenErrors":[]
		},

		write: (args) => {
			var deferred = Q.defer();

			var params = args.alerts.map(alert => {
				return {
					"data":		alert.data,
					"date": 	new Date(),
					"email": 	alert.email,
					"title": 	alert.title,
					"appId": 	alert.appId,
					"config": 	alert.config,
					"message": 	alert.message
				};
			});

			db.call({
				'params': 		params,
				'operation': 	'insertMany',
				'collection': 	'tblHistorical'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalAlerts.errorResponse.error.errors[0].code 	= err.code 			|| dalAlerts.errorResponse.error.errors[0].code;
				dalAlerts.errorResponse.error.errors[0].reason 	= err.description 	|| 'Write Historical Alerts Error';
				deferred.reject(dalAlerts.errorResponse);
			});

			return deferred.promise;
		},

		historical: (args) => {
			var deferred = Q.defer();

			var params = {
				'email': args.req.body.header.email
			};

			if (typeof(args.req.body.appId) != "undefined") {
				if (Array.isArray(args.req.body.appId)) {
					params.appId = {
						$in: args.req.body.appId.map(id => ObjectId(id))
					};
				} else {
					params.appId = ObjectId(args.req.body.appId);
				};
			};

			if (typeof(args.req.body.itemId) != "undefined") {
				if (Array.isArray(args.req.body.itemId)) {
					params.itemId = {
						$in: args.req.body.itemId.map(id => ObjectId(id))
					};
				} else {
					params.senderId = ObjectId(args.req.body.senderId);
				};
			};

			var skip = 0;
			if (typeof(args.req.body.skip) != "undefined") {
				skip = args.req.body.skip;
			};

			var sort = 0;
			if (typeof(args.req.body.sort) != "undefined") {
				sort = args.req.body.sort;
			};

			var limit = 10000;
			if (typeof(args.req.body.limit) != "undefined") {
				limit = args.req.body.limit;
			};

			var filter = {};
			if (typeof(args.req.body.filter) != "undefined") {
				filter._id = 0;
				args.req.body.filter.map(f => {
					filter[f] = 1;
				});
			};

			db.call({
				'sort': 		sort,
				'limit': 		limit,
				'filter': 		filter,
				'params': 		params,
				'operation': 	'find',
				'collection': 	'tblHistorical'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalAlerts.errorResponse.error.errors[0].code 	= err.code 			|| dalAlerts.errorResponse.error.errors[0].code;
				dalAlerts.errorResponse.error.errors[0].reason 	= err.description 	|| 'Get Historical Alerts Error';
				deferred.reject(dalAlerts.errorResponse);
			});

			return deferred.promise;
		}
	};

	var dalTokens = {
		errorResponse: {
			"error": {
				"code": 	401,
				"message": 	"Invalid Credentials",
				"errors":[{
					"reason": 		"General Senders Error",
					"message": 		"Invalid Credentials",
					"locaction": 	"dalTokens",
					"locationType": "header",
				}]
			},
			"hiddenErrors":[]
		},

		list: (args) => {
			var deferred = Q.defer();

			var params = {
				"email": {
					$in: args.req.body.users
				}
			};

			if (Array.isArray(args.req.body.appId) && args.req.body.appId.length > 0) {
				params.appId = {
					$in: args.req.body.appId
				};
			} else if (typeof(args.req.body.appId) == "string" && args.req.body.appId.length == 24) {
				params.appId = args.req.body.appId;
			};
			
			db.call({
				'params': 				params,
				'operation': 			'find',
				'collection': 			'tblTokens',
				'allowNoRecordsFound': 	true
			})
			.then(result => {
				args.tokens = result;
				deferred.resolve(args);
			}, err => {
				dalTokens.errorResponse.error.errors[0].code 	= err.code 			|| dalTokens.errorResponse.error.errors[0].code;
				dalTokens.errorResponse.error.errors[0].reason 	= err.description 	|| 'List Tokens Error';
				deferred.reject(dalTokens.errorResponse);
			});

			return deferred.promise;
		},

		register: (args) => {
			var deferred = Q.defer();

			var params = {
				"email": 	args.req.body.header.email,
				"appId": 	args.req.body.header.appId,
				"platform": args.req.body.platform
			};
			var update = {
				$set: {
					"email": 	args.req.body.header.email,
					"appId": 	args.req.body.header.appId,
					"token": 	args.req.body.token,
					"platform": args.req.body.platform
				}
			};
			
			db.call({
				'params': 		params,
				'update': 		update,
				'operation': 	'upsert',
				'collection': 	'tblTokens'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalTokens.errorResponse.error.errors[0].code 	= err.code 			|| dalTokens.errorResponse.error.errors[0].code;
				dalTokens.errorResponse.error.errors[0].reason = err.description 	|| 'Update Sender Error';
				deferred.reject(dalTokens.errorResponse);
			});

			return deferred.promise;
		},

		deregister: (args) => {
			var deferred = Q.defer();

			var params = {
				"token": 	args.req.body.token,
				"email": 	args.req.body.header.email,
				"appId": 	args.req.body.header.appId,
				"platform": args.req.body.platform
			};
			
			db.call({
				'params': 		params,
				'operation': 	'remove',
				'collection': 	'tblTokens'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalTokens.errorResponse.error.errors[0].code 	= err.code 			|| dalTokens.errorResponse.error.errors[0].code;
				dalTokens.errorResponse.error.errors[0].reason = err.description 	|| 'Update Sender Error';
				deferred.reject(dalTokens.errorResponse);
			});

			return deferred.promise;
		}
	};

	var dalSmsGateways = {
		errorResponse: {
			"error": {
				"code": 	401,
				"message": 	"Invalid Credentials",
				"errors":[{
					"reason": 		"General Apps Error",
					"message": 		"Invalid Credentials",
					"locaction": 	"dalSmsGateways",
					"locationType": "header",
				}]
			},
			"hiddenErrors":[]
		},

		add: (args) => {
			var deferred = Q.defer();

			var params = {
				'bitid': {
					'auth': {
						'users': 			args.req.body.users,
						'organizationOnly': args.req.body.organizationOnly
					}
				},
				'database': 	args.req.body.database,
				'serverDate': 	new Date(),
				'credentials': 	args.req.body.credentials,
				'description': 	args.req.body.description
			};

			db.call({
				'params': 		params,
				'operation': 	'insert',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				args.result = result[0];
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code 	= err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason = err.description 	|| 'Add Sms Gateway Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});
			
			return deferred.promise;
		},

		get: (args) => {
			var deferred = Q.defer();

			var params = {
				'_id': 						ObjectId(args.req.body.appId),
				'bitid.auth.users.email': 	args.req.body.header.email
			};

			var filter = {};
			if (typeof(args.req.body.filter) != "undefined") {
				filter._id = 0;
				args.req.body.filter.map(f => {
					if (f == 'appId') {
						filter['_id'] = 1;
					} else if (f == 'role' || f == 'users') {
						filter['bitid.auth.users'] = 1;
					} else if (f == 'organizationOnly') {
						filter['bitid.auth.organizationOnly'] = 1;
					} else {
						filter[f] = 1;
					};
				});
			};

			db.call({
				'params': 		params,
				'filter': 		filter,
				'operation': 	'find',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				args.result = result[0];
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code 	= err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason = err.description 	|| 'Get Sms Gateway Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});

			return deferred.promise;
		},

		list: (args) => {
			var deferred = Q.defer();

			var params = {
				'bitid.auth.users.email': args.req.body.header.email
			};

			if (typeof(args.req.body.appId) != "undefined") {
				if (Array.isArray(args.req.body.appId)) {
					params._id = {
						$in: args.req.body.appId.map(id => ObjectId(id))
					};
				} else {
					params._id = ObjectId(args.req.body.appId);
				};
			};

			var filter = {};
			if (typeof(args.req.body.filter) != "undefined") {
				filter._id = 0;
				args.req.body.filter.map(f => {
					if (f == 'appId') {
						filter['_id'] = 1;
					} else if (f == 'role' || f == 'users') {
						filter['bitid.auth.users'] = 1;
					} else if (f == 'organizationOnly') {
						filter['bitid.auth.organizationOnly'] = 1;
					} else {
						filter[f] = 1;
					};
				});
			};

			db.call({
				'params': 		params,
				'filter': 		filter,
				'operation': 	'find',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code 	= err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason = err.description 	|| 'List Sms Gateways Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});

			return deferred.promise;
		},

		load: (args) => {
			var deferred = Q.defer();

			var params = {};
			var filter = {
				'_id': 			1,
				'database': 	1,
				'credentials': 	1
			};

			db.call({
				'params': 		params,
				'filter': 		filter,
				'operation': 	'find',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				args.result = result.map(item => {
					return {
						'appId': 		item._id.toString(),
						'database': 	item.database,
						'credentials': 	item.credentials
					};
				});
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code 		= err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason 	= err.description 	|| 'Load Sms Gateways Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});

			return deferred.promise;
		},

		share: (args) => {
			var deferred = Q.defer();

			var params = {
				"bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 4
			            },
			            "email": args.req.body.header.email
			        },
			    	$ne: args.req.body.email
			    },
			    "_id": ObjectId(args.req.body.appId)
			};
			var update = {
				$set: {
					"serverDate": 	new Date()
				},
				$push: {
					"bitid.auth.users": {
				        "role": 	args.req.body.role,
				        "email": 	args.req.body.email
				    }
				}
			};

			db.call({
				'params': 		params,
				'update': 		update,
				'operation': 	'update',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code   = err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason = err.description 	|| 'Share Sms Gateway Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});

			return deferred.promise;
		},

		update: (args) => {
			var deferred = Q.defer();

			var params = {
				"bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 2
			            },
			            "email": args.req.body.header.email
			        }
			    },
			    "_id": ObjectId(args.req.body.appId)
			};
			var update = {
				$set: {
					"serverDate": new Date() 
				}
			};

			if (typeof(args.req.body.database) != "undefined") {
				update.$set.database = args.req.body.database;
			};
			if (typeof(args.req.body.credentials) != "undefined") {
				update.$set.credentials = args.req.body.credentials;
			};
			if (typeof(args.req.body.description) != "undefined") {
				update.$set.description = args.req.body.description;
			};
			if (typeof(args.req.body.organizationOnly) != "undefined") {
				update.$set["bitid.auth.organizationOnly"] = args.req.body.organizationOnly;
			};
			
			db.call({
				'params': 		params,
				'update': 		update,
				'operation': 	'update',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code 	= err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason = err.description 	|| 'Update Sms Gateway Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});

			return deferred.promise;
		},

		delete: (args) => {
			var deferred = Q.defer();

			var params = {
				"bitid.auth.users": {
			        $elemMatch: {
			            "role": 	5,
			            "email": 	args.req.body.header.email
			        }
			    },
			    "_id": ObjectId(args.req.body.appId)
			};

			db.call({
				'params': 		params,
				'operation': 	'remove',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code 	= err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason = err.description 	|| 'Delete Sms Gateways Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});

			return deferred.promise;
		},

		unsubscribe: (args) => {
			var deferred = Q.defer();

			var params = {
				"bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 4
			            },
			            "email": args.req.body.header.email
			        }
			    },
			    "_id": ObjectId(args.req.body.appId)
			};
			var update = {
				$set: {
					"serverDate": new Date()
				},
				$pull: {
					"bitid.auth.users": {
				        "email": args.req.body.email
				    }
				}
			};

			db.call({
				'params': 		params,
				'update': 		update,
				'operation': 	'update',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code   = err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason = err.description 	|| 'Unsubscribe User From App Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});

			return deferred.promise;
		},

		updatesubscriber: (args) => {
			var deferred = Q.defer();
			
			var params = {
				"bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 4
			            },    
			            "email": args.req.body.header.email
			        }
			    },
				"_id": ObjectId(args.req.body.appId)
			};
			
			db.call({
				'params': 		params,
				'operation': 	'find',
				'collection': 	'tblSmsGateways'
			})
			.then(result => {
				var deferred = Q.defer();

				var params = {
					"bitid.auth.users": {
				        $elemMatch: {
				            "email": args.req.body.email    
				        }
				    },
					"_id": ObjectId(args.req.body.appId)	
				};
				var update = { 
					$set: {
			            "bitid.auth.users.$.role": args.req.body.role
					}
				};

				deferred.resolve({
					'params': 		params,
					'update': 		update,
					'operation': 	'update',
					'collection': 	'tblSmsGateways'
				});

				return deferred.promise;
			}, null)
			.then(db.call, null)
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalSmsGateways.errorResponse.error.errors[0].code 	= err.code 			|| dalSmsGateways.errorResponse.error.errors[0].code;
				dalSmsGateways.errorResponse.error.errors[0].reason = err.description 	|| 'Update Sms Gateways Subscriber Error';
				deferred.reject(dalSmsGateways.errorResponse);
			});

			return deferred.promise;
		}
	};

	return {
		"alerts": 		dalAlerts,
		"tokens": 		dalTokens,
		"smsgateways": 	dalSmsGateways
	};
};

exports.module = module;