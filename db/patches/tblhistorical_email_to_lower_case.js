var index = 0;
var maximum = db.tblHistorical.count({});
var percentage = 0;

db.tblHistorical.aggregate([
    {
        $project: {
            _id: 1,
            email: {
                $toLower: '$email'
            }
        }
    }
]).forEach(row => {
    db.tblHistorical.update({
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