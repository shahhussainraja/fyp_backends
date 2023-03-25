var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const sellerProfile = require("../schemas/sellerProfileSchema")



router.post('/addProduct/:sellerId',upload.single('image'), async(req,res)=>{
  try{

    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new resize(imagePath);
    if (!req.file) 
     return res.status(401).json({error: 'Please provide an image'});
  
    const filename = await fileUpload.save(req.file.buffer);

    const image = "/images/"+filename;
 
    const result =  await sellerProfile.updateOne({
      "sellerProfileId" : req.params.sellerId
    },{
      "$push" : {
        "products" : {
            "productName" : req.body.productName,
            "ProductImage" : image,
            "productDetail" : req.body.productDetail,
            "productAmount" : req.body.productAmount,
            "productStatus" : req.body.status
        }
      }
    })
    res.status(200).send("data is saved")
  }catch(err){
    console.log(err.message);
    res.status(400).send(err.messsage);
  }
});





module.exports = router;