const mongodb = require("mongoose");


const sellerProfile = new mongodb.Schema({

    sellerProfileId: {
        type : String,
        required : true
    },
    orderAssigned : {
        type : Array
    },
    products : [
        {
            productName : String,
            ProductImage : String,
            productDetail : String,
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





