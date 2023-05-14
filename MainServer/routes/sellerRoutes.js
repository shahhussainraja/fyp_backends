var express = require('express');
var router = express.Router();
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const sellerCollection  = require("../schemas/sellerSchema");
const sellerProfile = require("../schemas/sellerProfileSchema")
var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

router.post('/signUpAsSeller', upload.single('image'), async(req,res)=>{
  try{

    let data = await sellerCollection.findOne({email : req.body.email})
    if(data) return res.status(400).send(false); 

    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new resize(imagePath);
    if (!req.file) 
     return res.status(400).json({error: 'Please provide an image'});
  
    const filename = await fileUpload.save(req.file.buffer);

    const seller = new sellerCollection
    seller.password = (req.body.password).toString();
    seller.name = req.body.name;
    seller.email = req.body.email;
    seller.phone = req.body.phone;
    seller.image = "/images/"+filename;
    seller.address = req.body.address;
    seller.CNIC = req.body.CNIC;
    seller.category = req.body.category;
    seller.shopName = req.body.shopName;
    await seller.generateHashedPassword();
    await seller.save();

    //Creating seller profile
    const profile  = new sellerProfile;
    profile.sellerProfileId = seller._id;
    profile.shopName = seller.shopName;
    await profile.save()

    return res.status(200).send(seller + "seller Saved and profile " + profile)
  }catch(err){
    console.log(err.message);
    res.status(400).send(err.messsage);
  }
});

router.post("/signInAsSeller",async (req, res)=>{
  try{

    let seller = await sellerCollection.findOne({ email : req.body.email })
    if(!seller) return res.status(401).send(false)

    let isValid = await bcrypt.compare(req.body.password, seller.password)
    if(!isValid) return res.status(401).send(false)

    let payload = {
      id : seller._id,
      name : seller.name,
      email : seller.email,
      image : seller.image,
      loggedIn : true,
      userType : seller.userType
    }
    

    let token  = jwt.sign(payload,process.env.jwtkey)
    res.status(200).send({token : token ,payload : payload})
    console.log(req.body.email + "Seller login ");

  }catch(err){
    console.log(err.message)
    res.status(400).send(err.message)
  }

})

  router.get("/sellerDetail/:sellerId", async(req,res)=>{
   try{
    let id = req.params.sellerId;
    let data  = await sellerCollection.findById(id)
    if(!data)
      return res.status(400).send("seller Not found!!")
      res.status(200).send(data)
  }catch(err){
      console.log(err.message)
      res.status(400).send(err.message)
  }
  })


  router.get("/currentUser" ,async (req ,res)=>{
      //check provide  in header
      let token = req.headers["token"];
      if (!token) return res.send("Token is no Provided");

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