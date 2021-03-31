db.tblTokens.aggregate([
    {
        $project: {
            email: {
                $toLower: '$email'
            },
            _id: 1,
            appId: 1,
            platform: 1
        }
    },
    {
        $group: {
            _id: {
                email: '$email',
                appId: '$appId',
                platform: '$platform'
            },
            count: {
                $sum: 1
            },
            records: {
                $push: {
                    date: {
                        $convert: {
                            input: '$_id',
                            to: 'date'
                        }
                    },
                    tokenId: '$_id'
                }
            }
        }
    },
    {
        $match: {
            count: {
                $gte: 2
            }
        }
    }
]);