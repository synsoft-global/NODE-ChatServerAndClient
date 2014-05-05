
module.exports = function (message, socketio, socket, socketUserMapping, connection, CommonObj) {    
    
    var LookupMsg = CommonObj.LookupMsg;
    var ObjLookupMessage = CommonObj.ObjLookupMessage;
    var Messages = CommonObj.Messages;
    socketio.set('log level', 1);    
    var sendmsg = {};
    sendmsg.UserList = [];
    var username = message.UserName;
    var password = message.Password;
    var sendmsg = {};
    sendmsg.UserList = [];
    sendmsg.UserList = "";
    //collection.find({ UserName: username, Password: password }, { Name: 1, id: 1 }).toArray(function (err, results) {    
    connection.query('select * from users where UserName = "' + username + '" and Password= "' + password + '"', function (err, results, fields) {
        if (err) {
            sendmsg.UserList = [];
            CommonObj.ErrorResponse(connection, err);
            sendmsg.Result = Messages(ObjLookupMessage.Error, LookupMsg);            
            sendmsg.Type = message.Type;
            sendmsg.UserName = message.UserName;
            socket.emit('message', sendmsg);            
        }
        else {            
            if (results.length > 0) {
                socket.join(results[0].id);
                socketUserMapping[socket.id] = results[0].id;                
                sendmsg.id = results[0].id;                
                /// Check here and update status to live
                connection.query('update users set status= 1  where id =' + results[0].id + '', function (err, res, fields) {
                    //connection.query('SELECT id,Name from users where id !=' + results[0].id + ' and status =1 and isDeleted= 0', function (err, results, fields) {
                    connection.query('SELECT id,Name from users where status =1 and isDeleted= 0', function (err, results, fields) {
                        sendmsg.Result = Messages(ObjLookupMessage.Success, LookupMsg);                        
                        sendmsg.Type = message.Type;
                        sendmsg.UserList = results;
                        sendmsg.UserName = message.UserName;
                        //socketio.sockets.in(results[0].id).emit('message', sendmsg);
                        socket.emit('message', sendmsg);

                    });
                });                
                connection.query('SELECT id, Name FROM users WHERE id =' + results[0].id + '', function (err, results, fields) {
                    sendmsg.Result = Messages(ObjLookupMessage.Success, LookupMsg);
                    //sendmsg.IsConnect = Messages(ObjLookupMessage.Connected, LookupMsg, ObjLookupMessage);
                    //sendmsg.Type = message.Type;
                    sendmsg.Type = '9';
                    sendmsg.UserList = results;
                    sendmsg.UserName = message.UserName;
                    socket.broadcast.emit('message', sendmsg);
                });
            }
            else {
                sendmsg.Result = Messages(ObjLookupMessage.NotAuthenticate, LookupMsg);                
                sendmsg.UserList = results;
                sendmsg.Type = message.Type;
                sendmsg.UserName = message.UserName;
                //sendmsg.Result = "UserName or Password is InCorrect";
                sendmsg.Code = 0;
                socket.emit('message', sendmsg);
                //socket.broadcast.emit('message', sendmsg);
            }
        }
    });     
}
