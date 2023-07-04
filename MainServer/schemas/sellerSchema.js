const mongodb = require("mongoose")
var bcrypt = require('bcryptjs');
const Joi = require("joi");

const seller = new mongodb.Schema({
    name: {
        type : String,
        required : true
    },
    email : {
        type: String,
        required : true
    },
    password:{
        type: String,
        required: true
    },
    phone: {
        type: Number,
    },
    shopName:{
        type : String
    },
    CNIC:{
        type : String,
        required : true
    },
    category:{
        type: Array
    },
    image:{
        type : String
    },
    userType : {
        type : String ,
        default  : "seller"
    },
    userStatus:{
        type: String,
        default : "active"
      }

})

seller.methods.generateHashedPassword = async function() {
    try {
      //encryption of password
      let salt = await bcrypt.genSalt(10);
      this.password =  await bcrypt.hash(this.password, salt);
    } catch (err) {
      res.send("error " + err.message);
    }
  
};

module.exports = mongodb.model("seller", seller );






