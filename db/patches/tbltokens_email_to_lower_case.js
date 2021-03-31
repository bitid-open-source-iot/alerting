var index = 0;
var maximum = db.tblTokens.count({});
var percentage = 0;

db.tblTokens.aggregate([
    {
        $project: {
            _id: 1,
            email: {
                $toLower: '$email'
            }
        }
    }
]).forEach(row => {
    db.tblTokens.update({
        _id: row._id
    }, {
        $set: {
            email: row.email
        }
    });
    index++;
    var progress = parseFloat(((index / maximum) * 100).toFixed(0));
    if (progress != percentage) {
        percentage = progress;
        print(percentage + '%');
    }; 
});