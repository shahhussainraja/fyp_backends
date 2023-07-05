var express = require('express');
var router = express.Router();
const orderModel = require("../schemas/orderSchema");
const { string } = require('joi');
require('dotenv').config({path: __dirname + '/.env'})
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const auth = require("../middleWare/auth")
const sellerProfile = require("../schemas/sellerProfileSchema")
const mongoose = require("mongoose");
const postModel = require("../schemas/postSchema");
const { json } = require('body-parser');
//for event trigger webhook
// stripe listen --forward-to localhost:8080/bespoke/webhook

// open a new power shell "stripe trigger payment_intent.succeeded" comand
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
            postId : req.body.postId      
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
            amount : parseInt(data.amount),
            image : data.image
        })
    })

    const order = new orderModel({
        buyerId: orderDetail[0]?.buyerId,
        buyerName: orderDetail[0]?.buyerName,
        sellerId : orderDetail[0]?.sellerId  ,
        sellerName: orderDetail[0]?.sellerName, 
        postId : orderDetail[0]?.postId,
        paymentIntentId: data.payment_intent,
        products:productsItems,
        totalAmount: parseInt(data.amount_total),
        deliveryAddress: data.customer_details?.address.line1,
        city:data.customer_details?.address.city,
        postalCode:data.customer_details?.address.postal_code,
        payment_status: data.payment_status,
});
await order.save();
return order;
}

function findSimilarObjects(originalArray) {
  const similarObjects = [];

  // Iterate through each object in the original array
  for (let i = 0; i < originalArray.length; i++) {
    const currentObject = originalArray[i];
    const similarGroup = [currentObject]; // Array to store similar objects

    // Compare the current object with the rest of the objects in the array
    for (let j = i + 1; j < originalArray.length; j++) {
      const comparedObject = originalArray[j];

      // Compare currentObject with comparedObject (Customize this comparison based on your object structure)
      if (currentObject.sId === comparedObject.sId) {
        similarGroup.push(comparedObject);
        originalArray.splice(j, 1); // Remove the similar object from the original array
        j--; // Decrement j to adjust for the removed object
      }
    }

    similarObjects.push(similarGroup);
  }

  return similarObjects;
}

const createCartOrder = async (customer, stripData) => {

  let orderDetail = JSON.parse(customer.metadata.order);
  
  //find same seller product from chart  
  let orderList = findSimilarObjects(orderDetail)

  console.log(orderList)

  orderList.map(async(data)=>{
    
    let productItems = []
    let totalAmount = 0 ; 
    let buyerId;
    let sellerId;
    let shopeName;
      data.map((singleProduct)=>{
        productItems.push({
          postTitle:singleProduct.pN,
          amount : singleProduct.pA,
      })

      totalAmount += singleProduct.pA ;
      buyerId = singleProduct.bId;
      sellerId = singleProduct.sId;
      shopeName = singleProduct.sN
    })

    try {
      const order = new orderModel({
      buyerId: buyerId,
      sellerId : sellerId,
      shopeName:shopeName,
      products: productItems,
      totalAmount: parseInt(totalAmount),
      paymentIntentId: stripData.payment_intent,
      deliveryAddress: stripData.customer_details?.address.line1,
      city:stripData.customer_details?.address.city,
      postalCode:stripData.customer_details?.address.postal_code,
      payment_status: stripData.payment_status,
      });
      await order.save();
    }catch(err){
      console.log(err.message)
    }

  })

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
            const customerData = JSON.parse(customer.metadata.order) 
            if(customerData[0].postId){
              // for customized orders
              const result = await createOrder(customer, data);
              console.log(result);
              await postModel.findByIdAndUpdate({_id : mongoose.Types.ObjectId(result.postId)},{"Status" : "Assigned"});
              console.log("payment Saved");
            }else{
              // for card Orders
              const result = await createCartOrder(customer,data);
            }

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
  const result = await orderModel.findOneAndUpdate({_id : req.params.id},
    {$set : {
          "orderStatus" : req.body.status
    }},{returnDocument : "after"});
    res.status(200).send(result)
    
    const newResult = await postModel.findOneAndUpdate({_id : result.postId},
    {$set : {
          "Status" : req.body.status
    }},{returnDocument : "after"});

    res.status(200).send(result)


  }catch(e){
    res.status(400).send(e.messaeg)
  }
})

router.post("/AddReview/:id",async(req,res)=>{
  
  try{

    const result = await orderModel.findOne({"_id" : req.params.id})
    result.review = req.body.review;
    result.reviewRating = req.body.ratingValue; 
    await result.save();
    
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


router.post("/makeCartPayment",auth,async(req,res)=>{
  // cart
  let orderDetail = req.body
  let refinedata = [];
  // due to limit of strip 500 character
  orderDetail.selectedItems.map((data)=>{
    refinedata.push({pN:data.productName,pA:data.productAmount,bId:data.buyerId,pId:data._id,sN:data.shopName,sId:data.sellerId})
  })  

  const customer = await stripe.customers.create({
      metadata: {
          order :JSON.stringify(refinedata) 
      },
    });
    console.log(customer.metadata.order)
  // console.log(req.body);
  // const { product, routes } = req.body;

  let line_items1 = [];
  orderDetail?.selectedItems?.map((data)=>{
    line_items1.push({
      price_data: {
          currency: "PKR",
          product_data: {
              name: data.productName,
              images: ["https://st2.depositphotos.com/4335005/8336/v/600/depositphotos_83367826-stock-illustration-vector-icon-with-long-shadow.jpg",],
          },
          unit_amount: data.productAmount * 100,
      },
      quantity: data.quantity || 1 ,
  })
  })

  try{

  const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items : line_items1,
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
  console.log(e.message)
  res.status(400).send(e.message);
}
     
})


  module.exports = router

//   `http://localhost:8080${req.body.image}`,

