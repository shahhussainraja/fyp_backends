const { number, string } = require("joi");
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
    },
    offerMessage:{
        type: String,
        default : false
    },


    //this Scheme here form Payment purpose through Stripe
    postId : {
        type : String,
        default : null
    },
    sellerId :{
        type:String,
        default:null

    },
    sellerName:{
        type:String,
        default:null
    },
    buyerId : {
        type:String,
        default:null
    },
    buyerName :{
        type:String,
        default:null

    },
    postTitle :{
        type:String,
        default:null

    },
    postDetail:{
        type:String,
        default:null

    },
    amount :{
        type:Number,
        default:null

    },
    city :{
        type:String,
        default:null

    },
    deliveryLocation :{
        type:String,
        default:null

    },
       image:{
        type:String,
        default:null
    }
},
{
 timestamps : true
}
)

module.exports  =  mongodb.model("message",messageSchema);

