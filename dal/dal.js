var Q       		= require('q');
var db				= require('../db/mongo');
var ObjectId 		= require('mongodb').ObjectId;
var ErrorResponse 	= require('../lib/error-response').ErrorResponse;

var module = function() {
	var dalAlerts = {
		get: (args) => {
			var deferred = Q.defer();

			var params = {
				'_id':		ObjectId(args.req.body.messageId),
				'email':	args.req.body.header.email
			};

			var filter = {};
			if (typeof(args.req.body.filter) != 'undefined') {
				filter._id = 0;
				args.req.body.filter.map(f => {
					if (f == 'messageId') {
						filter._id = 1;
					} else {
						filter[f] = 1;
					};
				});
			};

			db.call({
				'filter': 		filter,
				'params': 		params,
				'operation': 	'find',
				'collection': 	'tblHistorical'
			})
			.then(result => {
				args.result = result[0];
				deferred.resolve(args);
			}, err => {
				var err						= new ErrorResponse();
				err.error.code				= 503;
				err.error.errors[0].code	= error.code;
				err.error.errors[0].reason	= error.description;
				err.error.errors[0].message	= error.description;
				deferred.reject(err);
			});

			return deferred.promise;
		},

		write: (args) => {
			var deferred = Q.defer();

			var params = args.alerts.map(alert => {
				return {
					'data':		alert.data,
					'date': 	new Date(),
					'email': 	alert.email,
					'title': 	alert.title,
					'appId': 	ObjectId(alert.appId),
					'config': 	alert.config,
					'message': 	alert.message
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
			}, error => {
				var err						= new ErrorResponse();
				err.error.code				= 503;
				err.error.errors[0].code	= error.code;
				err.error.errors[0].reason	= error.description;
				err.error.errors[0].message	= error.description;
				deferred.reject(err);
			});

			return deferred.promise;
		},

		historical: (args) => {
			var deferred = Q.defer();

			var params = {
				'email': args.req.body.header.email
			};

			if (typeof(args.req.body.appId) != 'undefined') {
				if (Array.isArray(args.req.body.appId)) {
					params.appId = {
						$in: args.req.body.appId.map(id => ObjectId(id))
					};
				} else {
					params.appId = ObjectId(args.req.body.appId);
				};
			};

			if (typeof(args.req.body.skip) != 'undefined') {
				var skip = args.req.body.skip;
			};
			if (typeof(args.req.body.sort) != 'undefined') {
				var sort = args.req.body.sort;
			};
			if (typeof(args.req.body.limit) != 'undefined') {
				var limit = args.req.body.limit;
			};

			var filter = {};
			if (typeof(args.req.body.filter) != 'undefined') {
				filter._id = 0;
				args.req.body.filter.map(f => {
					if (f == 'messageId') {
						filter._id = 1;
					} else {
						filter[f] = 1;
					};
				});
			};

			db.call({
				'skip': 		skip,
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
				var err						= new ErrorResponse();
				err.error.code				= 503;
				err.error.errors[0].code	= error.code;
				err.error.errors[0].reason	= error.description;
				err.error.errors[0].message	= error.description;
				deferred.reject(err);
			});

			return deferred.promise;
		}
	};

	var dalTokens = {
		list: (args) => {
			var deferred = Q.defer();

			var params = {
				'email': {
					$in: args.req.body.users
				}
			};

			if (Array.isArray(args.req.body.appId) && args.req.body.appId.length > 0) {
				params.appId = {
					$in: args.req.body.appId
				};
			} else if (typeof(args.req.body.appId) == 'string' && args.req.body.appId.length == 24) {
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
				var err						= new ErrorResponse();
				err.error.code				= 503;
				err.error.errors[0].code	= error.code;
				err.error.errors[0].reason	= error.description;
				err.error.errors[0].message	= error.description;
				deferred.reject(err);
			});

			return deferred.promise;
		},

		register: (args) => {
			var deferred = Q.defer();

			var params = {
				'email': 	args.req.body.header.email,
				'appId': 	args.req.body.header.appId,
				'platform': args.req.body.platform
			};
			var update = {
				$set: {
					'email': 	args.req.body.header.email,
					'appId': 	args.req.body.header.appId,
					'token': 	args.req.body.token,
					'platform': args.req.body.platform
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
				var err						= new ErrorResponse();
				err.error.code				= 503;
				err.error.errors[0].code	= error.code;
				err.error.errors[0].reason	= error.description;
				err.error.errors[0].message	= error.description;
				deferred.reject(err);
			});

			return deferred.promise;
		},

		deregister: (args) => {
			var deferred = Q.defer();

			var params = {
				'token': 	args.req.body.token,
				'email': 	args.req.body.header.email,
				'appId': 	args.req.body.header.appId,
				'platform': args.req.body.platform
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
				var err						= new ErrorResponse();
				err.error.code				= 503;
				err.error.errors[0].code	= error.code;
				err.error.errors[0].reason	= error.description;
				err.error.errors[0].message	= error.description;
				deferred.reject(err);
			});

			return deferred.promise;
		}
	};

	return {
		'alerts': 	dalAlerts,
		'tokens':	dalTokens
	};
};

exports.module = module;