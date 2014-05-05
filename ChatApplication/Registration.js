
module.exports = function (message, socketio, socket, socketUserMapping, connection, CommonObj) {
    //socketio.set('log level', 1);
    var LookupMsg = CommonObj.LookupMsg;
    var ObjLookupMessage = CommonObj.ObjLookupMessage;
    var Messages = CommonObj.Messages;
    var sendmsg = {};
    //var format = require('util').format;
    sendmsg.UserList = [];
    connection.query('SELECT id, Name FROM users WHERE UserName="' + message.UserName + '" and IsDeleted=0', function (err, results, fields) {
        if (err) {
            sendmsg.UserList = [];
            sendmsg.Result = Messages(ObjLookupMessage.Error, LookupMsg);
            CommonObj.ErrorResponse(connection, err);
            sendmsg.Type = message.Type;
            sendmsg.UserName = message.UserName;
            socket.emit('message', sendmsg);
        }
        else {
            if (results.length > 0) {
                sendmsg.Result = Messages(ObjLookupMessage.AlreadyExists, LookupMsg);
                sendmsg.Type = message.Type;
                sendmsg.UserName = message.UserName;                                
                socket.emit('message', sendmsg);
                socket.broadcast.emit('message', sendmsg);
            }
            else {
                var post = {
                    Name: message.Name,
                    UserName: message.UserName,
                    Password: message.Password,
                    MobileNo: message.MobileNo,
                    Email: message.Email,
                    Status: 1,
                    IsDeleted: 0,
                    CreatedDate: new Date(),
                    LastLoggedInDate: new Date()
                };
                connection.query('INSERT INTO users SET ?', post, function (err, docs) {
                    if (err) {
                        sendmsg.UserList = [];
                        CommonObj.ErrorResponse(connection, err);
                        sendmsg.Result = Messages(ObjLookupMessage.Error, LookupMsg);
                        sendmsg.Type = message.Type;
                        sendmsg.UserName = message.UserName;
                        sendmsg.Code = 0;
                        socket.emit('message', sendmsg);
                        socket.broadcast.emit('message', sendmsg);
                    }
                    else {
                        socket.join(docs["insertId"]);
                        socketUserMapping[socket.id] = docs["insertId"];
                        sendmsg.id = docs["insertId"];
                        connection.query('select id,Name from users where id =' + docs["insertId"] + ' and IsDeleted=0 and Status = 1', function (err, results, fields) {       
                            sendmsg.Result = Messages(ObjLookupMessage.Success, LookupMsg);
                            sendmsg.UserList = results;
                            //sendmsg.Type = message.Type;
                            sendmsg.Type = '9';
                            sendmsg.UserName = message.UserName;
                            socket.broadcast.emit('message', sendmsg);
                        });
                        //connection.query('select id,Name from users where id !=' + docs["insertId"] + ' and IsDeleted=0 and Status = 1', function (err, results, fields) {                        
                        connection.query('select id,Name from users where IsDeleted=0 and Status = 1', function (err, results, fields) {                        
                            sendmsg.Result = Messages(ObjLookupMessage.Success, LookupMsg);
                            sendmsg.UserList = results;
                            sendmsg.Type = message.Type;
                            sendmsg.UserName = message.UserName;
                            socket.emit('message', sendmsg);
                        });
                    }
                });
            }
        }
    });
}
