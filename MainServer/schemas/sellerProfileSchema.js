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
            productStatus : String
        }
    ],
    reviews : 
    {
        type : Array
    }
})

ProfileModel = mongodb.model( "sellerProfile" , sellerProfile );

module.exports = ProfileModel;





