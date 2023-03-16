const mongodb = require("mongoose")
var bcrypt = require('bcryptjs');
const Joi = require("joi");


const buyer = new mongodb.Schema({
    name: {
        type : String,
        required : true
    },
    email : {
            type: String,
            required : true
    },
    password: String,
    phone: Number,
    image: String
})
 
buyer.methods.generateHashedPassword = async function() {
    try {
      //encryption of password
      let salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      res.send("error " + err.message);
    }
  
};
  

buyerModel = mongodb.model("buyer",buyer);

module.exports  = buyerModel

