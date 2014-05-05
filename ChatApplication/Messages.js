module.exports = function (type, LookupMsg) {
    var sendmsg = {};
    for (i = 0; i < LookupMsg.length; i++) {
        if (parseInt(LookupMsg[i].code) == type) {
            sendmsg.message = LookupMsg[i].message;
            sendmsg.Code = LookupMsg[i].code;
         
            return sendmsg;
            //TODO with err message save on Error response log
        }
    }
}
