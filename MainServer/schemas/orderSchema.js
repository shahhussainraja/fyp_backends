const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
      products: [
        {
          postTitle : String,
          postDetail : String,
          amount: Number,
          image : String
        },
      ],
      buyerId: {
         type : String,
      },
      buyerName: {
         type : String,
      },
      sellerId:{
        type:String
      }, 
      sellerName:{
        type:String
      },
      totalAmount:{
        type : Number
      },
      deliveryAddress:{
        type:String
      },
      city:{
        type:String
      },
      postalCode:{
        type:String
      },
      paymentStatus :{
        type : String
      },
      paymentIntentId :{
        type : String
      },
      orderStatus: {
        type: String,
        default: "Processing",
      },
      shopeName :{
        type: String,
      },
      review : {
        type : String,
        default : "false" 
      },
      postId :{
        type : String ,
      }

    },
    { timestamps: true }
  );
  

module.exports =  mongoose.model("Order", orderSchema);