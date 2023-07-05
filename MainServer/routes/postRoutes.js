var express = require('express');
var router = express.Router();
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const postCollection  = require("../schemas/postSchema")
var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const auth = require("../middleWare/auth")

router.post("/uploadPost",upload.single("image"),auth,async(req, res)=>{
    try{
    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new resize(imagePath);
    if (!req.file) 
    return res.status(401).json({error: 'Please provide an image'});
    
    const filename = await fileUpload.save(req.file.buffer);

    const post = new postCollection
    post.buyerId = req.body.buyerId,
    post.buyerName = req.body.buyerName,
    post.postTitle = req.body.title,
    post.postDetail = req.body.detail,
    post.dueDate = req.body.dueDate,
    post.city = req.body.city,
    post.price = req.body.amount,
    post.image = "/images/"+filename,
    post.deliveryLocation = req.body.address,
    post.category = req.body.category,
    await post.save();
    console.log(post + " Saved")
    res.status(200).send(true)

    }catch(err){
        console.log(err.message);
        res.status(400).send(err.message)
    }
})


router.post("/searchJobs",auth,async(req,res)=>{
    try{
  
      if(!req.query.key  && !req.query.Category){  
          const result = await postCollection.find({})  
          console.log("!req.query.key  && !req.query.Category")
          console.log(result)
          return res.status(200).send(result)
        }else if(req.query.key && req.query.Category){
          console.log("req.query.key  && req.query.Category")
              const result = await postCollection.find({
                "$and" : [{
                  "postTitle" : {$regex : req.query.key} },
                    {"category" : {$regex : req.query.Category } }]
                  })
                  return res.status(200).send(result);
            }else if(req.query.key && !req.query.Category ){
              console.log("req.query.key && !req.query.Category")
                    const result = await postCollection.find({
                      "$or" : [{
                        "postTitle" : {$regex : req.query.key} }]
                        });
                        return res.status(200).send(result);
              }else if(!req.query.key && req.query.Category ){  
                    const result = await postCollection.find({
                      "$or" : [{
                        "category" : {$regex : req.query.Category} }]
                        });
                        return res.status(200).send(result);
              }
    res.status(200).send("true") 
    }catch(err){
      res.status(400).send(err.message);
      console.log(err.message)
    }   
  })
  

router.get("/fetchAllPost",auth,async(req,res)=>{
    try{
        let data = await postCollection.aggregate([
          {
            $sort : {
              createdAt : -1
            }
          }
        ])
        if(!data)
            return res.status(400).send("No post found")
        
        console.log(data)
        return res.status(200).send(data)
    }catch(err){
    }

})


 router.get("/fetchPost/:id",auth,async(req,res)=>{
    try{
        let data = await postCollection.find({buyerId : req.params.id});
        if(!data)
            return res.status(400).send("No post found")
        
        return res.status(200).send(data)
    }catch(err){
    }

}) 

router.get("/deletPost/:id",auth,async(req,res)=>{
  console.log(req.params.id)
    try{
        let data = await postCollection.findByIdAndDelete({_id : req.params.id});
        if(!data)
            return res.status(400).send("No post found")
        return res.status(200).send(data)
    }catch(err){
    }

}) 



 
module.exports = router