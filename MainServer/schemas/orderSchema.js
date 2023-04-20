const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
      products: [
        {
          postTitle : String,
          postDetail : String,
          amount: Number
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
        type : String
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
        enum: ["Processing", "Shipped", "deliverd", "cancel"],
      },
    },
    { timestamps: true }
  );
  
orderModel =  mongoose.model("Order", orderSchema);
module.exports = orderModel;