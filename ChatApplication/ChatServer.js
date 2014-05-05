 
 ChatServer = {};
 ChatServer.Sockets ={};
 ChatServer.Sockets.MessageType = {
    CONNECT: '1',
    SENDCHAT: '2',
	CREATEROOM: '3',
	DISCONNECT: '4',
	REGISTRATION: '5',
    REQUESTCHAT:'6',
    STARTCHAT:'7',
    RESENTCHAT:'8'
}
ChatServer.Sockets.LookupMessage={
    Error : -1,
    Failure: 0,
    Success : 1,
    Connected :2,
    NotAuthenticate:3,
    AlreadyExists:4,
    NotConnected:5
}
var LookupMsg = [];
var oMatch =[];
  
var matches = {};
var socketUserMapping = {};

var fs = require('fs'), http = require('http'), socketio = require('c://Users/dev4/node_modules/socket.io/index.js');
var mysql = require('c://Users/dev4/node_modules/mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database:'ChatServer'
});
var Messages = require('./Messages.js');
var ErrorResponse = require('./ErrorResponse.js');
var CommonObj = {};
CommonObj.ObjLookupMessage = ChatServer.Sockets.LookupMessage;
CommonObj.Messages = Messages;
CommonObj.ErrorResponse = ErrorResponse;
//var dbServer = 'mongodb://127.0.0.1:27017/ChatTest'
var server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(fs.readFile(__dirname + '/index.html'));
}).listen(2525, function () {
    //console.log("LookupMsg.length " + LookupMsg.length);
    if (LookupMsg.length == 0) {
        connection.query('select * from lookupmessages', function (err, results, fields) {
            if (err) { console.log("err:-- " + err); }
            if (err) throw err;
            //console.log("results.length " + JSON.stringify(results));
            LookupMsg = results;
            CommonObj.LookupMsg = LookupMsg;           
        });
    }    
});

socketio = socketio.listen(server).on('connection', function (socket) {
    socket.on('message', function (msg) {
        socketio.set('log level', false);
        //set some configuration // when client disconnect then we get disconnect event in 10 sec using this setting
        socketio.set('heartbeat timeout', 10); // by default it is 60 sec
        socketio.set('heartbeat interval', 5); // by default it is 25 sec
        //heartbeat interval should be less then heartbeat timeout value.. 
        var message = eval('(' + unescape( msg )+ ')');
        console.log("message := ", JSON.stringify(message));
        if (LookupMsg.length == 0) {
            connection.query('select * from lookupmessages', function (err, results, fields) {
                if (err) { console.log("err:-- " + err); }
                LookupMsg = results;
                CommonObj.LookupMsg = LookupMsg;
            });
        }
        switch (message.Type) {
            case ChatServer.Sockets.MessageType.REGISTRATION:
                try {
                    var Registration = require('./Registration.js');
                    //Registration(message, socketio, socket, socketUserMapping, connection, LookupMsg, ChatServer.Sockets.LookupMessage);
                    Registration(message, socketio, socket, socketUserMapping, connection, CommonObj);
                }
                catch (ex) {
                    console.log("error" + ex);
                    CommonObj.ErrorResponse(connection, ex);
                }
                break;

            case ChatServer.Sockets.MessageType.CONNECT:
                var login = require('./Login.js');
                try {
                    //login(message, socketio, socket, socketUserMapping, connection, LookupMsg, ChatServer.Sockets.LookupMessage);
                    login(message, socketio, socket, socketUserMapping, connection, CommonObj);
                }
                catch (ex) {
                    CommonObj.ErrorResponse(connection, ex);
                }
                break;

            case ChatServer.Sockets.MessageType.SENDCHAT:
                try {
                    var SENDCHAT = require('./SendChat.js');
                    SENDCHAT(message, socketio, socket, dbServer, MongoClient, ObjectID);
                }
                catch (ex) {
                    CommonObj.ErrorResponse(connection, ex);
                }
                break;

            case ChatServer.Sockets.MessageType.CREATEROOM:
                try {
                    var CREATEROOM = require('./CreateRoom.js');
                    CREATEROOM(message, socketio, socket, connection);
                }
                catch (ex) {
                    CommonObj.ErrorResponse(connection, ex);
                }
                break;
            case ChatServer.Sockets.MessageType.DISCONNECT:
                try {
                    var DISCONNECT = require('./Disconnect.js');
                    DISCONNECT(message, socketio, socket, connection, CommonObj);
                }
                catch (ex) {
                    CommonObj.ErrorResponse(connection, ex);
                }
                break;
            case ChatServer.Sockets.MessageType.RESENTCHAT:
                try {
                    var RESENTCHAT = require('./RecentChat.js');
                    RESENTCHAT(message, socketio, socket, connection, CommonObj);
                }
                catch (ex) {
                    CommonObj.ErrorResponse(connection, ex);
                }
                break;
            case ChatServer.Sockets.MessageType.STARTCHAT:
                try {
                    var STARTCHAT = require('./StartChat.js');
                    STARTCHAT(message, socketio, socket, connection, CommonObj);
                }
                catch (ex) {
                    CommonObj.ErrorResponse(connection, ex);
                }
                break;
            case ChatServer.Sockets.MessageType.REQUESTCHAT:
                try {
                    var REQUESTCHAT = require('./RequestChat.js');
                    REQUESTCHAT(message, socketio, socket, connection, CommonObj);
                }
                catch (ex) {
                    CommonObj.ErrorResponse(connection, ex);
                }
                break;
        }
    })

    ///// disconnect event 

    socket.on('disconnect', function () {
        console.log("disconnect call");
        console.log("socket.id" + socket.id);
        var clientGUID = socketUserMapping[socket.id];
        //console.log("clientGUID" + clientGUID);
        delete socketUserMapping[socket.id];
        //console.log("new clientGUID" + clientGUID);        
        var ts = socketio.sockets.manager.roomClients[socket.id];
        console.log("new ts " + JSON.stringify(ts));
        var disonnectUser = {};
        for (var prop in socketio.sockets.manager.roomClients[socket.id]) {
            try {
                console.log("prop  new " + prop);
                if (prop != undefined && prop != "") {
                    prop = prop.replace("/", "");
                    console.log("prop  " + prop);
                    var message = {};
                    message.Id = prop;
                    message.Type = ChatServer.Sockets.MessageType.DISCONNECT;
                    var DISCONNECT = require('./Disconnect.js');
                    DISCONNECT(message, socketio, socket, connection, CommonObj);
                }
            }
            catch (ex) {
                console.log("Error reading prop:", ex);
                CommonObj.ErrorResponse(connection, ex);
            }
        }
    });
});

 