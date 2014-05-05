module.exports = function (message, socketio, socket, connection, CommonObj) {
    
    var LookupMsg = CommonObj.LookupMsg;
    var ObjLookupMessage = CommonObj.ObjLookupMessage;
    var Messages = CommonObj.Messages;
    var Messages = require('./Messages.js');
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
        ObjChat.text = message.Message;
        ObjChat.timestanp = new Date();        
    }

    function generateHexString(length) {
        var ret = "";
        while (ret < length) {
            ret += Math.random().toString(16).substring(2);
        }
        return ret.substring(0, length);
    } 

    //var allHangUsers = message.UserId +','+message.HangOutId;
    var allHangUsers = message.UserId +','+message.HangOutId;
    
    var chatHistory = [];        
        var usersObj ={};        
      
        var usersData = allHangUsers.split(",");             
        usersData.sort(function(a,b) {
          if (isNaN(a) || isNaN(b)) {
            return a > b ? 1 : -1;
          }
          return a - b;
        });     
          var post = {
                        users: usersData.toString(),
                        text: ObjChat ,
                        timeStamp:new Date()
                  };
        var res = allHangUsers.split(",");           
        connection.query('select id,SUBSTR(text,2) as text from chathistory where users = "'+ usersData.toString() +'"', function (err, results, fields) {
            if(err)
            {
                sendMsg.Result = Messages(ObjLookupMessage.Error, LookupMsg);
                sendMsg.Type=message.Type;                
                sendMsg.Text=message.Text;
                CommonObj.ErrorResponse(connection, err);
            }
            else
            {                
                if (results.length > 0) {
                    sendMsg.Result = Messages(ObjLookupMessage.Success, LookupMsg);
                    sendMsg.Type=message.Type;
                    sendMsg.ChatHistory = results;
                    sendMsg.Text=message.Text;
                    //socketio.sockets.in(message.HangOutId).emit('message', sendMsg);
                    //socket.emit('message', sendMsg);
                  
                     //socketio.sockets.in(res[0]).emit('message', sendMsg);
                    for(i=0; i<res.length;i++){                      
                         if(res[i]==message.UserId)
                          {                             
                            socketio.sockets.in(res[i]).emit('message', sendMsg);                           
                          }
                          else
                          {
                            sendMsg.hiddenHangoutid=message.UserId;
                            socketio.sockets.in(res[i]).emit('message', sendMsg);
                          }                                                                 
                    }
                }
                else
                {
                   connection.query('INSERT INTO chathistory SET ?', post, function (err, docs) {
                   //console.log("results" + JSON.stringify(docs["insertId"]));
                    connection.query('select id,SUBSTR(text,2) as text from chathistory where id =' + docs["insertId"] + '', function (err, results, fields) {                          
                            sendMsg.Result = Messages(ObjLookupMessage.Success, LookupMsg);
                            sendMsg.Type=message.Type;
                            sendMsg.ChatHistory = results;
                            sendMsg.Text=message.Text;
                           // socketio.sockets.in(message.HangOutId).emit('message', sendMsg);
                            //socket.emit('message', sendMsg);                  
                            for(i=0; i<res.length;i++){   
                              if(res[i]==message.UserId)
                              {                             
                                socketio.sockets.in(res[i]).emit('message', sendMsg);                           
                              }
                              else
                              {
                                sendMsg.hiddenHangoutid=message.UserId;
                                socketio.sockets.in(res[i]).emit('message', sendMsg);
                              }
                            }
                        });
                   });  
                }
            }
        });           
}
