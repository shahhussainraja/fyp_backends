var express = require('express');
var router = express.Router();
const orderModel = require("../schemas/orderSchema");
require('dotenv').config({path: __dirname + '/.env'})
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


  router.post("/makePayment",async(req,res)=>{

    let  routes ={
        success_url : "http://localhost:3000/PaymentSuccess",
        cancel_url : "http://localhost:3000/Post"

    }

    console.log(req.body);
    // const { product, routes } = req.body;

    try{

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
            price_data: {
                currency: "PKR",
                product_data: {
                    name: req.body.postTitle,
                    description:req.body.postDetail,
                    images: ["https://st2.depositphotos.com/4335005/8336/v/600/depositphotos_83367826-stock-illustration-vector-icon-with-long-shadow.jpg",],
                },
                unit_amount: req.body.amount * 100,
            },
            quantity: req.body.quantity || 1 ,
        }],
        
        mode: "payment",
        success_url: routes.success_url,
        cancel_url: routes.cancel_url,
    });
    res.json({ url  : session.url });
}catch(e){
    res.status(400).send(e.message);

}
       
  })


  module.exports = router

//   `http://localhost:8080${req.body.image}`,