const mongodb = require("mongoose")
var bcrypt = require('bcryptjs');
const Joi = require("joi");
const { date } = require("joi");


const post = new mongodb.Schema({
    buyerId: {
        type : String,
        required : true
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
    },
    createdAt:{
      type:Date,
      default:Date.now
    },
    Status:{
      type:String,
      default:"open"
    }
})
 

postModel = mongodb.model("post",post);

module.exports  = postModel

