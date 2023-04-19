const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
      products: [
        {
            productName : String,
            ProductImage : String,
            productDetail : String,
            productAmount : Number,
        },
      ],
      payment: {},
      buyer: {
         type : String,
      },
      seller:{
        type:String
      },
      status: {
        type: String,
        default: "Not Process",
        enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel"],
      },
    },
    { timestamps: true }
  );
  
module.exports =  mongoose.model("Order", orderSchema);