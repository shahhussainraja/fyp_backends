var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const sellerProfile = require("../schemas/sellerProfileSchema")
const auth = require("../middleWare/auth")

router.post('/addProduct',upload.single('image'),auth, async(req,res)=>{
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



router.get("/deleteItem",auth,async(req,res)=>{
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


router.post("/searchData",auth,async(req,res)=>{
  try{

    if(!req.query.key  && !req.query.Category){  
        const result = await sellerProfile.find({}).populate("products");
        console.log("!req.query.key  && !req.query.Category")
        console.log(result)
        return res.status(200).send(result)
      }else if(req.query.key && req.query.Category){
        console.log("req.query.key  && req.query.Category")
            const result = await sellerProfile.find({
              "$and" : [{
                "products.productName" : {$regex : req.query.key} },
                  {"products.productCategory" : {$regex : req.query.Category } }]
                })
                console.log(result)
                return res.status(200).send(result);
          }else if(req.query.key && !req.query.Category ){
            console.log("req.query.key && !req.query.Category")
                  const result = await sellerProfile.find({
                    "$or" : [{
                      "products.productName" : {$regex : req.query.key} }]
                      });
                      console.log(result)
                      return res.status(200).send(result);
            }else if(!req.query.key && req.query.Category ){  
                  const result = await sellerProfile.find({
                    "$or" : [{
                      "products.productCategory" : {$regex : req.query.Category} }]
                      });
                      console.log(result)
                      return res.status(200).send(result);
            }
  //   const result = await sellerProfile.find({},{
  //       "products" :{
  //         "$elemMatch":{
  //              "productName" : req.body.search
  //       }
  //     }
  // })
  
  // const result = await sellerProfile.find({
  //   "$and" : [{
  //     "products.productName" : {$regex : req.body.search} },
  //       {"products.productCategory" : {$regex : req.body.productCategory} }]
  // })
  res.status(200).send("true") 
  }catch(err){
    res.status(400).send(err.message);
    console.log(err.message)
  }   
})


router.get("/getAllItems/:id",auth ,async(req,res)=>{
try{
  const result = await sellerProfile.find({sellerProfileId  : req.params.id}).populate("products");
  res.status(200).send(result)
}catch(e){
  res.status(400).send(e.message);
}
})


//get all product of sellers
router.get("/getAllProducts",auth,async(req,res)=>{
try{
  const result = await sellerProfile.find({}).populate("products");
  res.status(200).send(result)
}catch(e){
  res.status(400).send(e.message);
}
})

router.get("/getAllReviews/:id",auth,async(req,res)=>{
  try{
    const result = await sellerProfile.find({sellerProfileId  : req.params.id}).populate("reviews");
    res.status(200).send(result)
  }catch(e){
    res.status(400).send(e.message);
  }
})




module.exports = router;