var express = require('express');
var router = express.Router();
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const buyerCollection  = require("../schemas/buyerSchema")
var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

router.post('/signUpAsBuyer', upload.single('image'), async(req,res)=>{
  try{

    let data = await buyerCollection.findOne({email : req.body.email})
    if(data) return res.status(200).send(false); 

    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new resize(imagePath);
    if (!req.file) 
     return res.status(401).json({error: 'Please provide an image'});
  
    const filename = await fileUpload.save(req.file.buffer);

    const buyer = new buyerCollection
    buyer.name = req.body.name,
    buyer.email = req.body.email,
    buyer.phone = req.body.phone,
    buyer.image = "/images/"+filename,
    buyer.password = req.body.password,
    await buyer.generateHashedPassword();
    buyer.save();

    res.status(200).send(true)
  }catch(err){
    console.log(err.message);
    res.status(400).send(err.messsage);
  }
});

router.post("/signInAsBuyer",async (req, res)=>{
  try{

    let buyer = await buyerCollection.findOne({ email : req.body.email })
    if(!buyer) return res.status(401).send(false)

    let isValid = await bcrypt.compare(req.body.password, buyer.password)
    if(!isValid) return res.status(401).send(false)

    let payload = {
      id : buyer._id,
      name : buyer.name,
      email : buyer.email,
      image : buyer.image,
      loggedIn : true,
      userType : buyer.userType
    }

    let token  = jwt.sign(payload,process.env.jwtkey)
    res.status(200).send({token : token ,payload : payload})
    console.log(req.body.email + "buyer login ");

  }catch(err){  
    console.log(err.message)
    res.status(400).send(err.message)
  }

})

  router.get("/buyerDetail/:buyerId", async(req,res)=>{
   try{
    let id = req.params.buyerId;
    let data  = await buyerCollection.findById(id)
    if(!data)
      return res.status(400).send("buyer Not found!!")
      res.status(200).send(data)
  }catch(err){
    console.log(err.message)
    res.status(400).send(err.message)
  }   
  })

  router.get("/currentUser" ,async (req ,res)=>{
      //check provide  in header
      let token = req.headers["token"];
      if (!token) return res.status(400).send("Token is no Provided");

      //here i decode the token which contain  user detail and token
      try {
        let user = jwt.verify(token, process.env.jwtkey);
        req.user = user;
        res.send(user)
      } catch (err) {
        res.status(400).send(err.message);
      }
  })




module.exports = router;
