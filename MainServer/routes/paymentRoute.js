var express = require('express');
var router = express.Router();
const orderModel = require("../schemas/orderSchema");
const { string } = require('joi');
require('dotenv').config({path: __dirname + '/.env'})
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const auth = require("../middleWare/auth")
const sellerProfile = require("../schemas/sellerProfileSchema")
const mongoose = require("mongoose");
//for event trigger webhook
// stripe listen --forward-to localhost:8080/bespoke/webhook
//Run his command on your powershell

 router.post("/makePayment",auth,async(req,res)=>{
    
    let orderDetail = [{
            buyerId:req.body.buyerId,
            buyerName : req.body.buyerName,
            sellerId: req.body.sellerId,
            sellerName : req.body.sellerName,
            postTitle: req.body.postTitle,
            postDetail: req.body.postDetail,
            amount:req.body.amount,
            image :req.body.image,      
  }]
    const customer = await stripe.customers.create({
        metadata: {
            order : JSON.stringify(orderDetail)
        },
      });
    // console.log(req.body);
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
        customer : customer.id,
        mode: "payment",
        success_url: `${process.env.success_url}`,
        cancel_url: `${process.env.cancel_url}`,
    });
    res.json({url  : session.url, });

    // const session2 = await stripe.checkout.sessions.retrieve(req.query.session_id);
    // const paymentIntent = await stripe.paymentIntents.retrieve(session2.payment_intent);
    // res.json(paymentIntent);

}catch(e){
    res.status(400).send(e.message);
}
       
})

//Create order for DataBase

// Create order function

const createOrder = async (customer, data) => {
    const orderDetail = JSON.parse(customer.metadata.order);
    let productsItems = [];
    orderDetail.map((data)=>{
        productsItems.push({
            postTitle:data.postTitle,
            postDetail:data.postDetail,
            amount : data.amount,
            image : data.image
        })
    })

    const order = new orderModel({
        buyerId: orderDetail[0]?.buyerId,
        buyerName: orderDetail[0]?.buyerName,
        sellerId : orderDetail[0]?.sellerId  ,
        sellerName: orderDetail[0]?.sellerName, 
        paymentIntentId: data.payment_intent,
        products:productsItems,
        totalAmount: data.amount_total,
        deliveryAddress: data.customer_details?.address.line1,
        city:data.customer_details?.address.city,
        postalCode:data.customer_details?.address.postal_code,
        payment_status: data.payment_status,
});
await order.save();
}


//  Stripe webhoook
router.post("/webhook",express.json({ type: "application/json" }),async (req, res) => {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    let webhookSecret;
    //webhookSecret = process.env.STRIPE_WEB_HOOK;

    if (webhookSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed:  ${err}`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data.object;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data.object;
      eventType = req.body.type;
    }

    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            // CREATE ORDER
            createOrder(customer, data);
            console.log("payment Saved");
          } catch (err) {
            console.log(typeof createOrder);
            console.log(err);
          }
        })
        .catch((err) => console.log(err.message));
    }

    res.status(200).end();
  }
);
//for Seller
router.get("/getSellerAllOrder/:id" ,auth, async(req,res)=>{
  
  try{

    const result = await orderModel.find({sellerId : req.params.id})
    res.status(200).send(result);
  }catch(e){
    res.status(400).send(e.message);

  }
})
//for buyer
router.get("/getBuyerAllOrder/:id" ,auth, async(req,res)=>{
  
  try{
    const result = await orderModel.find({buyerId : req.params.id})
    res.status(200).send(result);
  }catch(e){
    res.status(400).send(e.message);

  }
})

//for seller
router.post("/changeOrderStatus/:id",auth, async(req,res)=>{

  try{
  const result = await orderModel.updateOne({_id : req.params.id},
    {$set : {
          "orderStatus" : req.body.status
    }},{upsert : true});
    res.status(200).send(result)
  }catch(e){
    res.status(400).send(e.messaeg)
  }
})

router.post("/AddReview/:id",async(req,res)=>{
  
  try{
    // const result = await orderModel.findByIdAndUpdate({"_id" : req.params.id},{
    //   review : req.body.review
    // })
    
    const result = await orderModel.findOne({"_id" : req.params.id})
    result.review =req.body.review
    result.save();

    await sellerProfile.findOneAndUpdate({ "sellerProfileId" : result.sellerId},{
        "$push":{
          "reviews" : result
        }
      })
    res.status(200).send("Data Saved");  
  }catch(e){
    res.status(400).send(e.message);
    console.log(e.message)
  }
})


  module.exports = router

//   `http://localhost:8080${req.body.image}`,

