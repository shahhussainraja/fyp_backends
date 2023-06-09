const mongodb = require("mongoose")
var bcrypt = require('bcryptjs');
const Joi = require("joi");
const { date } = require("joi");


const post = new mongodb.Schema({
    buyerId:{
        type : String,
        required : true
    },
    buyerName : {
        type : String,
        requried : true
    },
    postTitle : {
      type: String,
      required : true
    },
    postDetail : {
      type: String,
      required : true
    },
    image: String,
    price:{
      type: Number,
      required: true
    },
    deliveryLocation:{
      type:String,
      required:true
    },
    category:{
      type:String,
      required:true
    },dueDate:{
      type:String,
      required:true
    },city:{
      type:String,
      required:true
    },
    createdAt:{
      type:Date,
      default:Date.now()
    },
    Status:{
      type:String,
      default:"open"
    },
    orderType :{
      type : String,
      default : "customized"
    }
})
 
module.exports  =  mongodb.model("post",post);


