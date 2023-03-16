var express = require('express');
var router = express.Router();
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const postCollection  = require("../schemas/postSchema")
var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

router.post("/uploadPost",upload.single("image"),async(req, res)=>{
    try{
    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new resize(imagePath);
    if (!req.file) 
    return res.status(401).json({error: 'Please provide an image'});
    
    const filename = await fileUpload.save(req.file.buffer);

    const post = new postCollection
    post.buyerId = req.body.buyerId,
    post.postTitle = req.body.postTitle,
    post.postDetail = req.body.postDetail,
    post.price = req.body.price,
    post.image = "/images/"+filename,
    post.deliveryLocation = req.body.deliveryLocation,
    post.category = req.body.category,
    await post.save();
    console.log(post + " Saved")
    res.status(200).send(post + " Saved")

    }catch(err){
        console.log(err.message);
        res.status(400).send(err.message)
    }
})

router.get("/getAllPost",async(req,res)=>{
    try{
        let data = await postCollection.find();
        if(!data)
            return res.status(400).send("No post found")
        
        return res.status(200).send(data)
    }catch(err){
    }

}) 
 
module.exports = router