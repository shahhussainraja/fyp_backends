const mongodb = require("mongoose");


const sellerProfile = new mongodb.Schema({

    sellerProfileId: {
        type : String,
        required : true
    },
    shopeName:{
        type:String
    },
    orderAssigned : {
        type : Array
    },
    products : [
        {
            productName : String,
            ProductImage : String,
            productDetail : String,
            productExtraInformation : String,
            productAmount : Number,
            productStatus : String,
            productCategory : String,
        }
    ],
    reviews : 
    {
        type : Array
    }
}) 
module.exports  = mongodb.model( "sellerProfile" , sellerProfile ); 





