
module.exports = function (message, socketio, socket, connection, CommonObj) {
    
    var LookupMsg = CommonObj.LookupMsg;
    var ObjLookupMessage = CommonObj.ObjLookupMessage;
    var Messages = CommonObj.Messages;    
    var sendMsg = {};    
    connection.query('select a.id,a.users,concat("[",a.text,"]") as text ,a.timeStamp,b.id as UserId,b.Name from chathistory a, users b  where b.id ="' + message.UserId + '" and find_in_set("' + message.UserId + '",a.users) <> 0 order by a.timestamp desc LIMIT 10', function (err, results, fields) {
        //console.log("call results : - " + JSON.stringify(results));
        if (err) {
            CommonObj.ErrorResponse(connection, err);
            sendMsg.Result = Messages(ObjLookupMessage.Error, LookupMsg);
            sendMsg.Type = message.Type;
            sendMsg.RecentList = "";
            socket.emit('message', sendMsg);
        } else {
            sendMsg.Result = Messages(ObjLookupMessage.Success, LookupMsg);
            if (results.length > 0) {
                sendMsg.Type = message.Type;
                sendMsg.RecentList = results;
                socket.emit('message', sendMsg);
            }
            else {
                sendMsg.Type = message.Type;
                sendMsg.RecentList = "";
                socket.emit('message', sendMsg);
            }
        }
    });
}