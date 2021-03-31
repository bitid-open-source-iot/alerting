const Q = require('q');

var module = function () {
	var responder = {
		errorResponse: {
			"error": {
				"code": 503,
				"message": "General Error",
				"errors": [{
					"code": 503,
					"reason": "General Error",
					"message": "General Error",
					"location": "Responder",
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
				get: (result) => {
					var deferred = Q.defer();

					deferred.resolve({
						'data': result.data,
						'date': result.date,
						'email': result.email,
						'title': result.title,
						'appId': result.appId,
						'config': result.config,
						'message': result.message,
						'messageId': result._id
					});

					return deferred.promise;
				},

				send: (result) => {
					var deferred = Q.defer();

					deferred.resolve({
						"inserted": result.length
					});

					return deferred.promise;
				},

				historical: (result) => {
					var deferred = Q.defer();

					result = result.map(obj => {
						return {
							'data': obj.data,
							'date': obj.date,
							'email': obj.email,
							'title': obj.title,
							'appId': obj.appId,
							'config': obj.config,
							'message': obj.message,
							'messageId': obj._id
						};
					});

					deferred.resolve(result);

					return deferred.promise;
				}
			},

			tokens: {
				register: (result) => {
					var deferred = Q.defer();

					deferred.resolve({
						"upserted": result.n
					});

					return deferred.promise;
				}
			}
		},

		model: (req, result) => {
			var deferred = Q.defer();

			switch (req.originalUrl) {
				case ('*'):
					deferred.resolve(result);
					break;

				case ('/alerting/alerts/get'):
					responder.response.alerts.get(result).then(deferred.resolve, deferred.reject);
					break;
				case ('/alerting/alerts/send'):
					responder.response.alerts.send(result).then(deferred.resolve, deferred.reject);
					break;
				case ('/alerting/alerts/historical'):
					responder.response.alerts.historical(result).then(deferred.resolve, deferred.reject);
					break;

				case ('/alerting/tokens/register'):
					responder.response.tokens.register(result).then(deferred.resolve, deferred.reject);
					break;
				case ('/alerting/tokens/deregister'):
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
					if (typeof (result[0]) !== 'undefined') {
						if (typeof (result[0].error) !== 'undefined') {
							if (result[0].error == 'No records found') {
								responder.errorResponse.error.code = 401;
								responder.errorResponse.error.message = 'No records found1';
							};
							responder.errorResponse(req, res, responder.errorResponse);
							return;
						};
					};
					res.json(result);
				}, err => {
					responder.errorResponse.error.code = 401;
					responder.errorResponse.error.message = err;
					responder.errorResponse(req, res, responder.errorResponse);
				});
		}
	};

	return responder;
};

exports.module = module;