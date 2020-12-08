const Q = require('q');
const db = require('./db/mongo');
const cors = require('cors');
const http = require('http');
const auth = require('./lib/auth');
const chalk = require('chalk');
const notify = require('./lib/notification');
const express = require('express');
const responder = require('./lib/responder');
const bodyparser = require('body-parser');
const healthcheck = require('@bitid/health-check');
const ErrorResponse = require('./lib/error-response');

global.__firebase = {
    'status': 'not_initialized'
};
global.__base = __dirname + '/';
global.__logger = require('./lib/logger');
global.__settings = require('./config.json');
global.__responder = new responder.module();

try {
    var portal = {
        api: (args) => {
            var deferred = Q.defer();

            try {
                var app = express();
                app.use(cors());
                app.use(bodyparser.urlencoded({
                    'limit': '50mb',
                    'extended': true,
                    'parameterLimit': 50000
                }));
                app.use(bodyparser.json({
                    'limit': '50mb'
                }));

                if (args.settings.authentication) {
                    app.use((req, res, next) => {
                        if (req.method != 'GET' && req.method != 'PUT') {
                            auth.authenticate({
                                'req': req,
                                'res': res
                            })
                                .then(result => {
                                    next();
                                }, err => {
                                    var error = { "error": err };
                                    __logger.info('authCheck error: ' + JSON.stringify(err));
                                    error.error.code = '401';
                                    error.error.errors[0].code = '401';
                                    __responder.error(req, res, error);
                                });
                        } else {
                            next();
                        };
                    });
                };

                app.use('/', express.static(__dirname + '/app/dist/alerting'));
                app.get('/*', (req, res) => {
                    res.sendFile(__dirname + '/app/dist/alerting/index.html');
                });

                var alerts = require('./api/alerts');
                app.use('/alerting/alerts', alerts);
                __logger.info('Loaded ./api/alerting/alerts');

                var tokens = require('./api/tokens');
                app.use('/alerting/tokens', tokens);
                __logger.info('Loaded ./api/alerting/tokens');

                app.use('/health-check', healthcheck);
                __logger.info('Loaded ./api/health-check');

                app.use((error, req, res, next) => {
                    var err = new ErrorResponse();
                    err.error.code = 500;
                    err.error.message = 'Something broke';
                    err.error.errors[0].code = 500;
                    err.error.errors[0].message = 'Something broke';
                    __responder.error(req, res, err);
                });

                var server = http.createServer(app);
                server.listen(args.settings.localwebserver.port);

                deferred.resolve(args);
            } catch (e) {
                __logger.info('initAPI catch error: ' + e);
                deferred.reject(e)
            };

            return deferred.promise;
        },

        init: (args) => {
            if (!args.settings.production || !args.settings.authentication) {
                var index = 0;
                console.log('');
                console.log('=======================');
                console.log('');
                console.log(chalk.yellow('Warning: '));
                if (!args.settings.production) {
                    index++;
                    console.log('');
                    console.log(chalk.yellow(index + ': You are running in ') + chalk.red('"Development Mode!"') + chalk.yellow(' This can cause issues if this environment is a production environment!'));
                    console.log('');
                    console.log(chalk.yellow('To enable production mode, set the ') + chalk.bold(chalk.green('production')) + chalk.yellow(' variable in the config to ') + chalk.bold(chalk.green('true')) + chalk.yellow('!'));
                };
                if (!args.settings.authentication) {
                    index++;
                    console.log('');
                    console.log(chalk.yellow(index + ': Authentication is not enabled ') + chalk.yellow(' This can cause issues if this environment is a production environment!'));
                    console.log('');
                    console.log(chalk.yellow('To enable Authentication mode, set the ') + chalk.bold(chalk.green('authentication')) + chalk.yellow(' variable in the config to ') + chalk.bold(chalk.green('true')) + chalk.yellow('!'));
                };
                console.log('');
                console.log('=======================');
                console.log('');
            };

            portal.logger(args)
                .then(portal.api, null)
                .then(portal.database, null)
                .then(portal.firebase, null)
                .then(args => {
                    console.log('Webserver Running on port: ', args.settings.localwebserver.port);
                }, err => {
                    console.log('Error Initializing: ', err);
                });
        },

        logger: (args) => {
            var deferred = Q.defer();

            try {
                __logger.init();
                deferred.resolve(args);
            } catch (err) {
                deferred.reject(err);
            };

            return deferred.promise;
        },

        firebase: (args) => {
            var deferred = Q.defer();

            notify.init(args)
                .then(connection => {
                    deferred.resolve(args);
                }, err => {
                    __logger.error('Start The Fire Error: ' + err);
                    deferred.reject(err);
                });

            return deferred.promise;
        },

        database: (args) => {
            var deferred = Q.defer();

            db.connect()
                .then(database => {
                    global.__database = database;
                    deferred.resolve(args);
                }, err => {
                    __logger.info('Database Connection Error: ' + err);
                    deferred.reject(err);
                });

            return deferred.promise;
        }
    };

    portal.init({
        'settings': __settings
    });
} catch (error) {
    console.log('The following error has occurred: ', error.message);
};

exports.module = module;