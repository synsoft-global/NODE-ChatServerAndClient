
var ChatServer = {};
ChatServer.Sockets = {};
ChatServer.Sockets.MessageType = {
    CONNECT: '1',
    SENDCHAT: '2',
    CREATEROOM: '3',
    DISCONNECT: '4',
    REGISTRATION: '5',
    REQUESTCHAT: '6',
    STARTCHAT: '7',
    RESENTCHAT: '8'
}
var usersListArr = [];
var iosocket = null;

$(document).ready(function () {
    // For Login Focus an enter key to a specific button
    //# Region Login
    $('#loginname').focus();
    $('#loginname').keypress(function (e) {
        if (e.keyCode == 13)
            $('#loginbtn').click();
    });
    $('#loginpassword').keypress(function (e) {
        if (e.keyCode == 13)
            $('#loginbtn').click();
    });
    //# End Region Login
    // For Registration Focus an enter key to a specific button
    //# Region Registration
    $('#usernametext').keypress(function (e) {
        if (e.keyCode == 13)
            $('#registerbtn').click();
    });
    $('#passwordtext').keypress(function (e) {
        if (e.keyCode == 13)
            $('#registerbtn').click();
    });
    $('#emailtext').keypress(function (e) {
        if (e.keyCode == 13)
            $('#registerbtn').click();
    });
    $('#nametext').keypress(function (e) {
        if (e.keyCode == 13)
            $('#registerbtn').click();
    });
    $('#mobilenotext').keypress(function (e) {
        if (e.keyCode == 13)
            $('#registerbtn').click();
    });

    //# End Region Registration
    //Start Chat 
    //# End Region Registration
    $('#textmsgid').keypress(function (e) {
        if (e.keyCode == 13)
            $('#submitbtn').click();
    });
    //# End Region Registration
});

//this is useful for Hangout user on clicking userlist
function HangOut(hangouid) {
    console.log("hangouid" + hangouid);
    $("#hiddenHangoutid").html(hangouid);
    $("a").removeClass("ActiveUser");
    $("#" + hangouid + " a").addClass("ActiveUser");
    var msgToSend = "{'Type':'6','Message':'','HangOutId':'" + hangouid + "','UserId':'" + $('#userid').html() + "'}";
    msgToSend = escape(msgToSend);
    iosocket.send(msgToSend);
}
//Connect to Socket server 
try {
    iosocket = io.connect("http://192.168.0.32:2525/");
}
catch (ex) {
    console.log("Error connecting to Server: ", ex);
}

// Listen Socket Connection detail.
iosocket.on('connect', function () {
    iosocket.on('message', function (message) {
        console.log("message== " + JSON.stringify(message));
        switch (message.Type) {
            case ChatServer.Sockets.MessageType.CONNECT:
                $('#userid').html(message.id);
                usersListArr = message.UserList;
                if (message.Result.Code == 1) {
                    $("#idName").html(message.UserName);
                    $("#userlistid").html('');
                    //$("#userlistid").html("<br/><br/><b>Online User List<b><br/>");
                    $("#userlistid").html("<h4>Online User List</h4>");
                    if (message.UserList.length > 1) {
                        for (i = 0; i < message.UserList.length; i++) {
                            var userid = new String(message.UserList[i].id);
                            if (message.UserList[i].id != message.id) {                                
                                if ($('#'+message.UserList[i].id).length <= 0) {
                                    $('#userlistid').append($('<li id="' + message.UserList[i].id + '" />', {    //here appending `<li>`
                                        'data-role': "list-divider"
                                    }).append($('<a/>', {    //here appending `<a>` into `<li>`                                            
                                        'href': '#',
                                        'class': 'onlineUser',
                                        'onclick': 'HangOut("' + userid + '")',
                                        'text': message.UserList[i].Name
                                    })));
                                }
                            }
                        }
                    }
                    else {
                        //$("#userlistid").append("<br/><span>No Other User Online</span>");
                    }
                    $("#OnlineUser").show();
                    $("#registrationDIV").hide();
                    $("#LoginSection").hide();
                    $("#viewid").show();
                }
                else {
                    alert(message.Result.message);
                }
                break;

            case ChatServer.Sockets.MessageType.DISCONNECT:
                console.log(message.DisconnectId)
                //$("#" + message.DisconnectId).text("");
                $("#" + message.DisconnectId).remove();
                if ($("#hiddenHangoutid").html() == message.DisconnectId) {
                    $("#hiddenHangoutid").html("");
                    $("#chatdetail").hide();
                }

                break;
            case ChatServer.Sockets.MessageType.REGISTRATION:
                var userCount = parseInt($("#ConnectedUserCount").html());
                $('#userid').html(message.id);
                console.log(message.UserList.length);
                $("#idName").html(message.UserName);
                if (message.Result.Code == 1) {
                    $("#userlistid").html('');
                    //$("#userlistid").html("<br/><br/><b>Online User List<b><br/>");
                    $("#userlistid").html("<h4>Online User List</h4>");
                    usersListArr = message.UserList;
                    if (message.UserList.length > 1) {
                        for (i = 0; i < message.UserList.length; i++) {
                            var userid = new String(message.UserList[i].id);
                            if (message.UserList[i].id != message.id) {
                                //$("#userlistid").append("<br/><span><a class='onlineUser' href='#' id=\"" + message.UserList[i].id + "\" onclick='HangOut(\"" + userid + "\",\"" + message.UserList[i].Name + "\")'>" + message.UserList[i].Name + "</a></span>");
                                $('#userlistid').append($('<li id="' + message.UserList[i].id + '" />', {    //here appending `<li>`
                                    'data-role': "list-divider"
                                }).append($('<a/>', {    //here appending `<a>` into `<li>`                                            
                                    'href': '#',
                                    'class': 'onlineUser',
                                    'onclick': 'HangOut("' + userid + '")',
                                    'text': message.UserList[i].Name
                                })));

                                //$('ul').listview('refresh');
                            }
                        }
                    }
                    else {
                        //$("#userlistid").append("<br/><span>No Other User Online</span>");
                    }
                    $("#OnlineUser").show();
                    $("#registrationDIV").hide();
                    $("#LoginSection").hide();
                    $("#viewid").show();
                }
                else {
                    alert(message.Result.message);
                }
                console.log("usersListArr 2 " + JSON.stringify(usersListArr));
                break;
            case ChatServer.Sockets.MessageType.REQUESTCHAT:
                $("#chathistory").val("");

                console.log("results" + JSON.stringify(message.ChatHistory));
                console.log("message.ChatHistory.length" + message.ChatHistory.length);
                if (message.hiddenHangoutid) {
                    $("#hiddenHangoutid").html(message.hiddenHangoutid);
                    $("#" + message.hiddenHangoutid + " a").addClass("ActiveUser");
                }

                var arr = [];
                var obj = document.getElementById("chathistory");
                obj.scrollTop = obj.scrollHeight;
                for (j = 0; j < message.ChatHistory.length; j++) {
                    if (message.ChatHistory[0].text != '') {
                        var temparr = message.ChatHistory[0].text.split("},");

                        for (i = 0; i < temparr.length; i++) {
                            if (i == temparr.length - 1) {
                                arr.push(jQuery.parseJSON(temparr[i]));
                            }
                            else {
                                arr.push(jQuery.parseJSON(temparr[i] + "}"));

                            }
                            if (usersListArr.length > 0) {
                                for (k = 0; k < usersListArr.length; k++) {
                                    if (usersListArr[k].id == arr[i].senderid) {
                                        obj.value += " \n" + usersListArr[k].Name + " : " + unescape(arr[i].text);
                                    }
                                }
                            }
                        }
                    }
                    //console.log("message.ChatHistory" + array[0]);
                    $("#hiddenChatHistoryid").html('');
                    $("#hiddenChatHistoryid").html(message.ChatHistory[j].id);
                }
                $("#chatdetail").show();
                $("#textmsgid").focus();
                break;
            case ChatServer.Sockets.MessageType.STARTCHAT:
                var obj = document.getElementById("chathistory");

                console.log("usersListArr new " + JSON.stringify(usersListArr));
                if (usersListArr.length > 0) {
                    for (i = 0; i < usersListArr.length; i++) {
                        console.log("usersListArr new " + message.UserId + " ==  " + usersListArr[i].Name);
                        console.log("usersListArr new " + usersListArr[i].id + " ==  " + usersListArr[i].Name);
                        if (usersListArr[i].id == message.UserId) {
                            obj.value += " \n" + usersListArr[i].Name + " : " + unescape(message.Text);
                        }
                    }
                }
                obj.scrollTop = obj.scrollHeight;
                break;
            case ChatServer.Sockets.MessageType.RESENTCHAT:
                console.log(message.RecentList.length);
                $('#userid').html(message.id);
                $("#recentlistid").html('');
                $("#recentlistid").html("<h4>Recent User List</h4>");

                for (k = 0; k < message.RecentList.length; k++) {
                    if (usersListArr.length > 0) {
                        var array = message.RecentList[k].users.split(",");
                        for (i = 0; i < usersListArr.length; i++) {
                            for (j = 0; j < array.length; j++) {
                                console.log("usersListArr " + array[j] + "=== " + usersListArr[i].id);
                                if (usersListArr[i].id == array[j]) {
                                    if (array[j] != $('#userid').html()) {
                                        //                                                    $('#recentlistid ul').append($('<li id="' + usersListArr[i].id + '#recent" />', {    //here appending `<li>`
                                        //                                                        'data-role': "list-divider"
                                        //                                                    }).append($('<a/>', {    //here appending `<a>` into `<li>`                                            
                                        //                                                        'href': '#',
                                        //                                                        'class': 'onlineUser',
                                        //                                                        'onclick': 'HangOut("' + usersListArr[i].id + '")',
                                        //                                                        'text': usersListArr[i].Name
                                        //                                                    }))); 
                                        $("#recentlistid").append("<span><a  href='#' id=\"" + usersListArr[i].id + "\" onclick='HangOut(\"" + usersListArr[i].id + "\")'>" + usersListArr[i].Name + "</a></span>");
                                        $("#recentlistid").append("<br/>");
                                    }
                                }
                            }
                        }
                    }
                }
                $("#userlistid").hide();
                $("#OnlineUser").show();
                $("#textmsgid").focus();
                $("#chathistory").val("");
                break;
            case "9":
                console.log(message.UserList.length);
                for (i = 0; i < message.UserList.length; i++) {
                    var userid = new String(message.UserList[i].id);
                    usersListArr.push(message.UserList[i]);
                    //$("#userlistid").append("<br/><span><a href='#' class='onlineUser' id=\"" + message.UserList[i].id + "\" onclick='HangOut(\"" + userid + "\",\"" + message.UserList[i].Name + "\")'>" + message.UserList[i].Name + "</a></span>");
                    $('#userlistid').append($('<li id="' + message.UserList[i].id + '" />', {    //here appending `<li>`
                        'data-role': "list-divider"
                    }).append($('<a/>', {    //here appending `<a>` into `<li>`                                            
                        'href': '#',
                        'class': 'onlineUser',
                        'onclick': 'HangOut("' + userid + '")',
                        'text': message.UserList[i].Name
                    })));

                    //$('ul').listview('refresh');
                }
                console.log("usersListArr" + JSON.stringify(usersListArr));
                break;
        }
    });
    $("#logoutbtn").bind('click', function () {
        var msgToSend = "{'Type':'4' ,'Id':'" + $('#userid').html() + "'}";
        msgToSend = escape(msgToSend);
        iosocket.send(msgToSend);
        $("#LoginSection").show();
        $("#OnlineUser").hide();
        $("#chatdetail").hide();
        $("#chathistory").val("");
        $("#viewid").hide();
    });
    $("#submitbtn").bind('click', function () {
        if ($('#textmsgid').val() == "") {
            alert("please enter text");
        }
        else {
            var msgToSend = "{'Type':'7' ,'Message':'" + escape($('#textmsgid').val()) + "','HangOutId':'" + $('#hiddenHangoutid').html() + "','UserId':'" + $('#userid').html() + "','ChathistoryId':'" + $("#hiddenChatHistoryid").html() + "'}";
            msgToSend = escape(msgToSend);
            iosocket.send(msgToSend);
        }
        $('#textmsgid').val("");
    });
    $("#registerbtn").bind('click', function () {

        if ($('#usernametext').val().trim() == "") {
            alert("User Name Required");
        }
        else if ($('#passwordtext').val().trim() == "") {
            alert("Password Required");
        }
        else if ($('#emailtext').val().trim() == "") {
            alert("Email Required");
        }
        else if ($('#nametext').val().trim() == "") {
            alert(" Name Required");
        }

        else if ($('#mobilenotext').val().trim() == "") {
            alert("Mobile No Required");
        }
        else {
            var msgToSend = "{'Name':'" + $('#nametext').val() + "','Type':'5','UserName':'" + $('#usernametext').val() + "','Password':'" + $('#passwordtext').val() + "','MobileNo':'" + $('#mobilenotext').val() + "','Email':'" + $('#emailtext').val() + "'}";
            msgToSend = escape(msgToSend);
            iosocket.send(msgToSend);
            $('#nametext').val("");
            $('#usernametext').val("");
            $('#passwordtext').val("");
            $('#mobilenotext').val("");
            $('#emailtext').val("");
        }
    });
    $("#loginbtn").bind('click', function () {
        var name = $('#loginname').val().trim();
        var pswd = $('#loginpassword').val().trim();
        if (pswd == "") {
            alert("Password Required");
        }
        else if (name == "") {
            alert("User Name Required");
        }
        else {
            var msgToSend = "{'Type':'1','UserName':'" + $('#loginname').val() + "','Password':'" + $('#loginpassword').val() + "'}";
            msgToSend = escape(msgToSend);
            console.log("msgToSend " + msgToSend);
            iosocket.send(msgToSend);
            $('#loginname').val("");
            $('#loginpassword').val("");
        }
    });
    $("#recentlist").bind('click', function () {
        //var msgToSend = "{'Name':'" + $('#nametext').val() + "','Type':'5','UserName':'" + $('#usernametext').val() + "','Password':'" + $('#passwordtext').val() + "','MobileNo':'" + $('#mobilenotext').val() + "','Email':'" + $('#emailtext').val() + "'}";
        $("#recentlist").addClass("active");
        $("#contactlist").removeClass("active");
        $("#recentlistid").show();
        var msgToSend = "{'Type':'8','UserId':'" + $('#userid').html() + "'}";
        msgToSend = escape(msgToSend);
        console.log("msgToSend" + msgToSend);
        iosocket.send(msgToSend);
    });
});
function toggelDiv() {
    $("#registrationDIV").show();
    $("#LoginSection").hide();
    $("#usernametext").focus();
}
function toggelDivLogin() {
    $("#registrationDIV").hide();
    $("#LoginSection").show();
    $("#loginname").focus();
}
function toggelcontacts() {
    $("#recentlist").removeClass("active");
    $("#contactlist").addClass("active");
    $("#userlistid").show();
    $("#recentlistid").hide();
}
  