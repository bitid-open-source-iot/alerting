const Q = require('q');
const db = require('../db/mongo');
const Time = require('../lib/time');
const ObjectId = require('mongodb').ObjectId;
const ErrorResponse = require('../lib/error-response');

var module = function () {
	var dalAlerts = {
		get: (args) => {
			var deferred = Q.defer();

			var params = {
				'_id': ObjectId(args.req.body.messageId),
				'email': args.req.body.header.email
			};

			var filter = {};
			if (typeof (args.req.body.filter) != 'undefined') {
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
				'filter': filter,
				'params': params,
				'operation': 'find',
				'collection': 'tblHistorical'
			})
				.then(result => {
					args.result = result[0];
					deferred.resolve(args);
				}, err => {
					var err = new ErrorResponse();
					err.error.code = 503;
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					err.error.errors[0].message = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		write: (args) => {
			var deferred = Q.defer();

			var params = args.alerts.map(alert => {
				return {
					'data': alert.data,
					'date': new Date(),
					'email': alert.email,
					'title': alert.title,
					'appId': ObjectId(alert.appId),
					'config': alert.config,
					'message': alert.message
				};
			});

			db.call({
				'params': params,
				'operation': 'insertMany',
				'collection': 'tblHistorical'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse();
					err.error.code = 503;
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					err.error.errors[0].message = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		historical: (args) => {
			var deferred = Q.defer();
			
			var match = {
				'email': args.req.body.header.email
			};

			if (typeof (args.req.body.date) != 'undefined' && args.req.body.date !== null) {
				if (typeof (args.req.body.date.to) != 'undefined' && args.req.body.date.to !== null) {
					if (typeof (match.date) != 'undefined' && match.date !== null) {
						match.date = {};
					};
					match.date.$lte = new Date(args.req.body.date.to);
					match.date.$lte.setHours(23);
					match.date.$lte.setMinutes(59);
					match.date.$lte.setSeconds(59);
					match.date.$lte.setMilliseconds(999);
				};
				if (typeof (args.req.body.date.from) != 'undefined' && args.req.body.date.from !== null) {
					if (typeof (match.date) != 'undefined' && match.date !== null) {
						match.date = {};
					};
					match.date.$gte = new Date(args.req.body.date.from);
					match.date.$gte.setHours(0);
					match.date.$gte.setMinutes(0);
					match.date.$gte.setSeconds(0);
					match.date.$gte.setMilliseconds(0);
				};
			};

			if (typeof (args.req.body.time) != 'undefined' && args.req.body.time !== null) {
				if (typeof (args.req.body.time.to) != 'undefined' && args.req.body.time.to !== null) {
					if (typeof (match['time.hours']) != 'undefined' && match['time.hours'] !== null) {
						match['time.hours'] = {};
					};
					if (typeof (match['time.minutes']) != 'undefined' && match['time.minutes'] !== null) {
						match['time.minutes'] = {};
					};
					if (typeof (match['time.seconds']) != 'undefined' && match['time.seconds'] !== null) {
						match['time.seconds'] = {};
					};
					if (typeof (match['time.milliseconds']) != 'undefined' && match['time.milliseconds'] !== null) {
						match['time.milliseconds'] = {};
					};
					var to = new Time(args.req.body.time.to);
					match['time.hours'].$lte = to.getHours();
					match['time.minutes'].$lte = to.getMinutes();
					match['time.seconds'].$lte = to.getSeconds();
					match['time.milliseconds'].$lte = to.getMilliseconds();
				};
				if (typeof (args.req.body.time.from) != 'undefined' && args.req.body.time.from !== null) {
					if (typeof (match['time.hours']) != 'undefined' && match['time.hours'] !== null) {
						match['time.hours'] = {};
					};
					if (typeof (match['time.minutes']) != 'undefined' && match['time.minutes'] !== null) {
						match['time.minutes'] = {};
					};
					if (typeof (match['time.seconds']) != 'undefined' && match['time.seconds'] !== null) {
						match['time.seconds'] = {};
					};
					if (typeof (match['time.milliseconds']) != 'undefined' && match['time.milliseconds'] !== null) {
						match['time.milliseconds'] = {};
					};
					var from = new Time(args.req.body.time.from);
					match['time.hours'].$gte = from.getHours();
					match['time.minutes'].$gte = from.getMinutes();
					match['time.seconds'].$gte = from.getSeconds();
					match['time.milliseconds'].$gte = from.getMilliseconds();
				};
			};

			if (typeof (args.req.body.data) != 'undefined' && args.req.body.data !== null) {
				if (Object.keys(args.req.body.data).length > 0) {
					Object.keys(args.req.body.data).map(key => {
						if (Array.isArray(args.req.body.data[key])) {
							match['data.' + key] = {
								$in: args.req.body.data[key]
							};
						} else {
							match['data.' + key] = args.req.body.data[key];
						};
					});
				};
			};

			if (typeof (args.req.body.appId) != 'undefined') {
				if (Array.isArray(args.req.body.appId)) {
					match.appId = {
						$in: args.req.body.appId.filter(id => (id !== null && id.length == 24)).map(id => ObjectId(id))
					};
				} else if (args.req.body.appId !== null && args.req.body.appId.length == 24) {
					match.appId = ObjectId(args.req.body.appId);
				};
			};

			var skip = 0;
			if (typeof (args.req.body.skip) != 'undefined') {
				skip = Math.floor(args.req.body.skip);
			};
			
			var sort = {'_id': 1};
			if (typeof (args.req.body.sort) != 'undefined') {
				sort = args.req.body.sort;
			};

			var limit = 0;
			if (typeof (args.req.body.limit) != 'undefined') {
				limit = Math.floor(args.req.body.limit);
			};

			var filter = {};
			if (typeof (args.req.body.filter) != 'undefined') {
				filter._id = 0;
				args.req.body.filter.map(f => {
					if (f == 'messageId') {
						filter._id = 1;
					} else {
						filter[f] = 1;
					};
				});
			};

			var params = [
				{
					$project: {
						'time': {
							'hours': {
								$hour: '$date'
							},
							'minutes': {
								$minute: '$date'
							},
							'seconds': {
								$second: '$date'
							},
							'milliseconds': {
								$millisecond: '$date'
							}
						},
						'_id': 1,
						'data': 1,
						'date': 1,
						'email': 1,
						'title': 1,
						'appId': 1,
						'config': 1,
						'message': 1
					}
				},
				{
					$match: match
				},
				{
					$project: filter
				},
				{
					$sort: sort
				},
				{
					$skip: skip
				},
				{
					$limit: limit
				}
			];

			db.call({
				'params': params,
				'operation': 'aggregate',
				'collection': 'tblHistorical'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse();
					err.error.code = 503;
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					err.error.errors[0].message = error.description;
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
			} else if (typeof (args.req.body.appId) == 'string' && args.req.body.appId.length == 24) {
				params.appId = args.req.body.appId;
			};

			db.call({
				'params': params,
				'operation': 'find',
				'collection': 'tblTokens',
				'allowNoRecordsFound': true
			})
				.then(result => {
					args.tokens = result;
					deferred.resolve(args);
				}, err => {
					var err = new ErrorResponse();
					err.error.code = 503;
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					err.error.errors[0].message = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		register: (args) => {
			var deferred = Q.defer();

			var params = {
				'email': args.req.body.header.email,
				'appId': args.req.body.header.appId,
				'platform': args.req.body.platform
			};
			var update = {
				$set: {
					'email': args.req.body.header.email,
					'appId': args.req.body.header.appId,
					'token': args.req.body.token,
					'platform': args.req.body.platform
				}
			};

			db.call({
				'params': params,
				'update': update,
				'operation': 'upsert',
				'collection': 'tblTokens'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, err => {
					var err = new ErrorResponse();
					err.error.code = 503;
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					err.error.errors[0].message = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		deregister: (args) => {
			var deferred = Q.defer();

			var params = {
				'token': args.req.body.token,
				'email': args.req.body.header.email,
				'appId': args.req.body.header.appId,
				'platform': args.req.body.platform
			};

			db.call({
				'params': params,
				'operation': 'remove',
				'collection': 'tblTokens'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, err => {
					var err = new ErrorResponse();
					err.error.code = 503;
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					err.error.errors[0].message = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		}
	};

	return {
		'alerts': dalAlerts,
		'tokens': dalTokens
	};
};

exports.module = module;