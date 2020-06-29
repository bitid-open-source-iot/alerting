var Q = require('q');

var module = function() {
	var responder = {
		errorResponse:{
			"error": {
				"code": 	503,
				"message": 	"General Error",
				"errors":[{
					"code": 		503,
					"reason": 		"General Error",
					"message": 		"General Error",
					"locaction": 	"Responder",
					"locationType": "Responder"
				}]
			}
		},

		response: {
			update: (result) => {
				var deferred = Q.defer();

				deferred.resolve({
					"updated": result.n
				});

				return deferred.promise;
			},

			delete: (result) => {
				var deferred = Q.defer();

				deferred.resolve({
					"deleted": result.n
				});

				return deferred.promise;
			},

			alerts: {
				send: (result) => {
					var deferred  = Q.defer();
					
					deferred.resolve({
						"inserted": result.length
					});

					return deferred.promise;
				},

				historical: (result) => {
					var deferred  = Q.defer();
					
					result = result.map(obj => {
						return {
							'data': 	obj.data,
							'date':		obj.date,
							'email': 	obj.email,
							'title': 	obj.title,
							'appId': 	obj.appId,
							'config': 	obj.config,
							'message': 	obj.message,
						};
					});

					deferred.resolve(result);

					return deferred.promise;
				}
			},

			tokens: {
				register: (result) => {
					var deferred  = Q.defer();
					
					deferred.resolve({
						"upserted": result.n
					});

					return deferred.promise;
				}
			},

			smsgateways: {
				add: (result) => {
					var deferred = Q.defer();

					deferred.resolve({
						"smsgatewayId": result._id
					});

					return deferred.promise;
				},

				get: (result) => {
					var deferred  = Q.defer();

					var tmp = {
						'role': 		result.role,
						'token': 		result.token,
						'appId': 		result.appId,
						'serverDate': 	result.serverDate,
						'description': 	result.description,
						'smsgatewayId': result._id
					};
					if (typeof(result.bitid) != "undefined") {
						if (typeof(result.bitid.auth) != "undefined") {
							tmp.users 				= result.bitid.auth.users;
							tmp.organizationOnly 	= result.bitid.auth.organizationOnly;
						};
					};

					deferred.resolve(tmp);
					
					return deferred.promise;
				},

				list: (result) => {
					var deferred  = Q.defer();

					result = result.map(obj => {
						var tmp = {
							'role': 		obj.role,
							'token': 		obj.token,
							'appId': 		obj.appId,
							'serverDate': 	obj.serverDate,
							'description': 	obj.description,
							'smsgatewayId': obj._id
						};
						if (typeof(obj.bitid) != "undefined") {
							if (typeof(obj.bitid.auth) != "undefined") {
								tmp.users 				= obj.bitid.auth.users;
								tmp.organizationOnly 	= obj.bitid.auth.organizationOnly;
							};
						};
						return tmp;
					});

					deferred.resolve(result);
					
					return deferred.promise;
				}
			}
		},

		model: (req, result) => {
			var deferred = Q.defer();

			switch(req.originalUrl) {
				case('*'):
					deferred.resolve(result);
					break;
				
				case('/alerting/alerts/send'):
					responder.response.alerts.send(result).then(deferred.resolve, deferred.reject);
					break;
				case('/alerting/alerts/historical'):
					responder.response.alerts.historical(result).then(deferred.resolve, deferred.reject);
					break;

				case('/alerting/tokens/register'):
					responder.response.tokens.register(result).then(deferred.resolve, deferred.reject);
					break;

				case('/alerting/smsgateways/add'):
					responder.response.smsgateways.add(result).then(deferred.resolve, deferred.reject);
					break;
				case('/alerting/smsgateways/get'):
					responder.response.smsgateways.get(result).then(deferred.resolve, deferred.reject);
					break;
				case('/alerting/smsgateways/list'):
					responder.response.smsgateways.list(result).then(deferred.resolve, deferred.reject);
					break;

				case('/alerting/smsgateways/share'):
				case('/alerting/smsgateways/update'):
				case('/alerting/smsgateways/unsubscribe'):
				case('/alerting/smsgateways/updatesubscriber'):
					responder.response.update(result).then(deferred.resolve, deferred.reject);
					break;

				case('/alerting/smsgateways/delete'):
					responder.response.delete(result).then(deferred.resolve, deferred.reject);
					break;

				default:
					deferred.resolve({
						'success': 'your request resolved successfully but this payload is not modeled'
					});
					break;
			};

			return deferred.promise;
		},

		error: (req, res, err) => {
			if (typeof err == 'object') {
				try {
					__logger.error(err);
				} catch (e) {
					__logger.error('Skipped writing an Error. Could not stringify the err object');
				};
			} else {
				__logger.error(err);
			};
			
			res.status(err.error.code).json(err.error);
		},

		success: (req, res, result) => {
			responder.model(req, result)
			.then(result => {
				if (typeof(result[0]) !== 'undefined') {
					if (typeof(result[0].error) !== 'undefined') {
						if (result[0].error == 'No records found') {
							responder.errorResponse.error.code 		= 401;
							responder.errorResponse.error.message 	= 'No records found1';
						};
						responder.errorResponse(req, res, responder.errorResponse);
						return;				
					};
				};
				res.json(result);
			}, err => {
				responder.errorResponse.error.code 		= 401;
				responder.errorResponse.error.message 	= err;
				responder.errorResponse(req, res, responder.errorResponse);
			});
		}
	};

	return responder;
};

exports.module = module;