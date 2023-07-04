var express = require('express');
var router = express.Router();
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const buyerCollection  = require("../schemas/buyerSchema")
var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const auth = require("../middleWare/auth")


router.post('/signUpAsBuyer', upload.single('image'), async(req,res)=>{
  try{

    let data = await buyerCollection.findOne({email : req.body.email})
    if(data) return res.status(400).send(false); 

    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new resize(imagePath);
    if (!req.file) 
     return res.status(400).json({error: 'Please provide an image'});
  
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
    if(!buyer) return res.status(410).send(false)

    let isValid = await bcrypt.compare(req.body.password, buyer.password)
    if(!isValid) return res.status(410).send(false)
    if(buyer.userStatus !== "active"){
      return res.status(411).send(false)
    }

    let payload = {
      id : buyer._id,
      name : buyer.name,
      email : buyer.email,
      image : buyer.image,
      loggedIn : true,
      userType : buyer.userType
    }

    //token will Expire in 7 days
    // ath.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    let token  = jwt.sign(payload,process.env.jwtkey,{expiresIn : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)})
    res.status(200).send({token : token ,payload : payload})
    console.log(req.body.email + "buyer login ");

  }catch(err){      
    console.log(err.message)
    res.status(400).send(err.message)
  }

})

  router.get("/buyerDetail/:buyerId",auth, async(req,res)=>{
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

  router.get("/currentUser" ,auth ,async (req ,res)=>{
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
