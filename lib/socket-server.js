const http = require('http');
const auth = require('./auth');
const format = require('./format');
const crypto = require('crypto');
const WebSocketServer = require('websocket').server;

const add = (socket, params) => {
    socket.on('close', (data) => {
        for (var i = global.__sockets.length - 1; i >= 0; i--) {
            if (global.__sockets[i].userId == socket.userId) {
                global.__sockets.splice(i, 1);
                break;
            };
        };
    });

    global.__sockets.push({
        'email': format.email(params.email),
        'token': params.token,
        'route': params.route,
        'socket': socket,
        'userId': socket.userId
    });
};

class SocketServer {

    constructor() {
        global.__sockets = [];

        var httpServer = http.createServer();
        httpServer.listen(__settings.websocket.port)

        var server = new WebSocketServer({
            'httpServer': httpServer
        });

        console.log('Websocket Running on port: ', __settings.websocket.port);

        server.on('request', (request) => {
            var params = request.resourceURL.query || {};
            var socket = request.accept(null, request.origin);

            try {
                socket.userId = (crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64));

                if (typeof (params.email) != "undefined" && typeof (params.token) != "undefined" && typeof (params.appId) != "undefined" && typeof (params.route) != "undefined") {
                    if (__settings.authentication) {
                        auth.authenticate({
                            'req': {
                                'body': {
                                    'header': {
                                        'email': format.email(params.email),
                                        'appId': params.appId
                                    }
                                },
                                'headers': {
                                    'authorization': params.token
                                },
                                'originalUrl': request.resourceURL.pathname
                            }
                        })
                            .then(res => {
                                add(socket, params);
                            })
                            .catch(err => {
                                socket.close(4001);
                            });
                    } else {
                        add(socket, params);
                    };
                } else {
                    socket.close(1007);
                };
            } catch (err) {
                console.log(err.message);
                socket.close(1007);
            };
        });
    }

    async send(email, catagory, data) {
        delete data.filter;
        delete data.header;
        catagory = catagory.split(':');
        const route = catagory[0];
        const process = catagory[1];
        try {
            var sent = 0;
            for (var i = global.__sockets.length - 1; i >= 0; i--) {
                if (global.__sockets[i].email == format.email(email) && global.__sockets[i].route == route) {
                    global.__sockets[i].socket.send(JSON.stringify({
                        result: data,
                        process: process
                    }));
                    sent++;
                };
            };
            return {
                'ok': true,
                'result': sent
            };
        } catch (error) {
            return {
                'ok': false,
                'error': error
            };
        };
    }

}

module.exports = SocketServer;