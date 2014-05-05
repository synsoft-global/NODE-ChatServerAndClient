
module.exports = function (message, socketio, socket, connection,CommonObj) {

    var LookupMsg = CommonObj.LookupMsg;
    var ObjLookupMessage = CommonObj.ObjLookupMessage;
    var Messages = CommonObj.Messages;    
    var sendMsg = {};    
    var ObjChat = {}
    if (message.Message == null || message.Message == "")
    {
        ObjChat = "";
    }
    else
    {    
        ObjChat.senderid = message.UserId;
        ObjChat.recId = message.HangOutId; //HangOutId may be more then 1 via common seprated.
        ObjChat.text =  message.Message;
        ObjChat.timestamp = new Date();        
    }        
    
    var ObjChatStr= JSON.stringify(ObjChat).toString();        
    var UpdateDate = new Date();
        
    connection.query("UPDATE chathistory SET text =concat(ifnull(text,''), ',"+ ObjChatStr +"') , timeStamp = '"+ UpdateDate +"' where id = "+ message.ChathistoryId +"", function (err, results, fields) {        
        if(err)
        {
            CommonObj.ErrorResponse(connection, err);
        }
    });
    connection.query("UPDATE chathistory SET text =concat(ifnull(text,''), ',"+ ObjChatStr +"') , timeStamp = "+ UpdateDate +" where id = "+ message.ChathistoryId +"", function (err, results, fields) {    
        if(err)
        {
            CommonObj.ErrorResponse(connection, err);
        }
    });
    var allHangUsers = message.UserId+ ','+ message.HangOutId;
    sendMsg.Result = Messages(ObjLookupMessage.Success, LookupMsg);
    sendMsg.Type=message.Type;
    sendMsg.UserId = message.UserId;
    sendMsg.Text=message.Message;
    //socket.emit('message', sendMsg);
    var res = allHangUsers.split(",");                
    for(i=0; i<res.length;i++){    
        //setTimeout(function(){
            socketio.sockets.in(res[i]).emit('message', sendMsg);
        //},100);
    }
}
