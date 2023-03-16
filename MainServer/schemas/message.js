const mongodb = require("mongoose");


const messageSchema = new mongodb.Schema({
    conversationId: {
        type : String,
    },
    senderId :{
        type: String,
    },
    message: {
        type : String
    }
},
{
 timestamps : true
}
)

module.exports  =  mongodb.model("message",messageSchema);

