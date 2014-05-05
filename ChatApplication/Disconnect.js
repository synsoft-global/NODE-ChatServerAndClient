
module.exports = function (message, socketio, socket, connection, CommonObj) {
    var SendMsg = {};    
    connection.query('update users set status = 0 where id =' + message.Id, function (err, results, fields) {
        if (err) {
            CommonObj.ErrorResponse(connection, err);
        }
        else {            
            SendMsg.Type = message.Type;
            SendMsg.DisconnectId = message.Id;
            socket.broadcast.emit('message', SendMsg);
        }
    });
}