var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const sellerProfile = require("../schemas/sellerProfileSchema")


router.post('/addProduct',upload.single('image'), async(req,res)=>{
  try{

    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new resize(imagePath);
    if (!req.file) 
     return res.status(400).json({error: 'Please provide an image'});
  
    const filename = await fileUpload.save(req.file.buffer);

    const image = "/images/"+filename;
 
    const result =  await sellerProfile.updateOne({
      "sellerProfileId" : req.body.sellerId
    },{
      "$push" : {
        "products" : {
            "productName" : req.body.productName,
            "ProductImage" : image,
            "productDetail" : req.body.productDetail,
            "productAmount" : req.body.productAmount,
            "productCategory" : req.body.category,
            "productStatus" : req.body.status
        }
      }
    })
    res.status(200).send("data is saved")
    console.log(result);
  }catch(err){
    console.log(err.message);
    res.status(400).send(err.messsage);
  }
});



router.get("/deleteItem",async(req,res)=>{

  try{
      const result = await sellerProfile.updateOne({sellerProfileId  : req.query.sellerId},{
        "$pull" : {
          "products" :{
            "_id" : req.query.productId 
          }
        }
    })
    res.status(200).send(result)
  }catch(e){
      res.status(400).send(e.message)
      console.log(e.message)
  }


})








router.get("/getAllItems/:id",async(req,res)=>{

try{
  const result = await sellerProfile.findOne({sellerProfileId  : req.params.id}).populate("products");
  res.status(200).send(result)
}catch(e){
  res.status(400).send(e.message);
}
})




module.exports = router;