const Q = require('q');
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');

exports.alert = async (email, title, message, plain) => {
    const transporter = await nodemailer.createTransport(__settings.smtp);

    if (plain) {
        const response = await transporter.sendMail({
            'to': email,
            'from': __settings.production ? __settings.from : __settings.smtp.auth.user,
            'text': message,
            'html': message,
            'subject': title
        });
    
        if (response.rejected.length > 0) {
            return {
                'ok': false,
                'error': {
                    'code': 401,
                    'message': 'email rejected'
                }
            };
        } else {
            return {
                'ok': true,
                'result': {}
            };
        };
    } else {
        await transporter.use('compile', hbs({
            'viewEngine': {
                'extName': '.hbs',
                'layoutsDir': __dirname + '/templates',
                'partialsDir': __dirname + '/templates',
                'defaultLayout': 'alert.hbs'
            },
            'extName': '.hbs',
            'viewPath': __dirname + '/templates'
        }));
    
        const response = await transporter.sendMail({
            'context': {
                'title': title,
                'message': message
            },
            'to': email,
            'from': __settings.production ? __settings.from : __settings.smtp.auth.user,
            'subject': title,
            'template': 'alert'
        });
    
        if (response.rejected.length > 0) {
            return {
                'ok': false,
                'error': {
                    'code': 401,
                    'message': 'email rejected'
                }
            };
        } else {
            return {
                'ok': true,
                'result': {}
            };
        };
    }
};