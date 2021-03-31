var tokens = db.getCollection('tblTokens');
if (tokens.count() == 0) {
    db.tblTokens.insert({
        '_id': ObjectId('000000000000000000000001'),
        'email': 'xxx@xxx.co.za',
        'appId': ObjectId('000000000000000000000001'),
        'token': 'xxx',
        'platform': 'xxx',
        'serverDate': ISODate()
    });

    db.tblTokens.createIndex({
        'email': 1,
        'appId': 1,
        'platform': 1
    }, {
        'unique': true
    });
};

var historical = db.getCollection('tblHistorical');
if (historical.count() == 0) {
    db.tblHistorical.insert({
        'config': {
            'push': {
                'sent': false,
                'token': null,
                'error': null,
                'failed': false,
                'enabled': false
            },
            'email': {
                'sent': false,
                'error': null,
                'failed': false,
                'enabled': false
            },
            'slack': {
                'sent': false,
                'token': 'xxx',
                'error': null,
                'failed': false,
                'channel': 'xxx',
                'enabled': false
            },
            'trello': {
                'sent': false,
                'error': null,
                'board': 'xxx',
                'failed': false,
                'enabled': false
            }
        },
        '_id': ObjectId('000000000000000000000001'),
        'email': 'xxx@xxx.co.za',
        'title': 'xxx',
        'appId': ObjectId('000000000000000000000001'),
        'message': 'xxx',
        'senderId': ObjectId('000000000000000000000001'),
        'serverDate': ISODate()
    });

    db.tblHistorical.createIndex({
        'email': 1,
        'appId': 1,
        'serverDate': 1
    }, {
        'unique': false
    });
};