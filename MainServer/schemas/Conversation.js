const mongodb = require("mongoose");


const conversationSchema = new mongodb.Schema({
    members: {
        type : Array,
    },
},
{
 timestamps : true
}
)

module.exports  =  mongodb.model("conversation",conversationSchema);

