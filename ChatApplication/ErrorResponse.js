module.exports = function (connection, err) {
    var post = {
        detail: err,
        dateTimeStamp: new Date()
    };
    connection.query('INSERT INTO errorresponse SET ?', post, function (err, docs) {
        //TODO if required
    });
}
