var express = require("express");
const router = express.Router();
require('dotenv').config({ path: __dirname + '/.env' })
const BuyerModel = require("../schemas/buyerSchema")
const SellerModel = require("../schemas/sellerSchema")
const OrderModel = require("../schemas/orderSchema")
const sellerProfile = require("../schemas/sellerProfileSchema")


router.post("/AdminLogin", async (req, res) => {
    const { password, email } = req.body;
    if (password === process.env.AdminPassword && email === process.env.AdminEmail) {
        return res.status(200).json(true)
    } else {
        return res.status(401).json(false)
    }
})

router.get("/getAllBuyersDetail", async (req, res) => {
    try {
        const result = await BuyerModel.find();
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get("/getSellerProductsDetail/:id", async (req, res) => {
    try {
        const result = await sellerProfile.find({ "sellerProfileId": req.params.id }).select("products");
        return res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err.message);

    }
})


router.get("/getAllSellersDetail", async (req, res) => {
    try {
        const result = await SellerModel.find();
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})


router.post("/blockSeller/:id", async (req, res) => {
    try {
        const result = await SellerModel.findOneAndUpdate({ _id: req.params.id }, {
            "$set": {
                "userStatus": "Blocked"
            }
        }, { returnDocument: "after" })
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/unblockSeller/:id", async (req, res) => {
    try {
        const result = await SellerModel.findOneAndUpdate({ _id: req.params.id }, {
            "$set": {
                "userStatus": "active"
            }
        }, { returnDocument: "after" })
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/blockBuyer/:id", async (req, res) => {
    try {
        const result = await BuyerModel.findOneAndUpdate({ _id: req.params.id }, {
            "$set": {
                "userStatus": "Blocked"
            }
        }, { returnDocument: "after" })
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/unblockBuyer/:id", async (req, res) => {
    try {
        const result = await BuyerModel.findOneAndUpdate({ _id: req.params.id }, {
            "$set": {
                "userStatus": "active"
            }
        }, { returnDocument: "after" })
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/deleteBuyer/:id", async (req, res) => {
    try {
        const result = await BuyerModel.findByIdAndRemove({ _id: req.params.id })
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/deleteSeller/:id", async (req, res) => {
    try {
        const result = await BuyerModel.findByIdAndRemove({ _id: req.params.id })
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})


// pending Order Detail
router.get("/AllOrderDetails", async (req, res) => {
    try {
        const result = await OrderModel.find({ "orderStatus": "Completed" })
        return res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error.message)
    }

})



router.get("/desboardInformation",async(req,res)=>{

    try{
        const TotalRevenue = await OrderModel.aggregate([
            {
                "$group" :{
                    _id :"",
                    total : {
                        "$sum" : "$totalAmount"
                    },
                    totalOrder :{
                        "$sum" : 1 
                    }
                }
            }

        ])

        const ProcessOrders = await OrderModel.aggregate([
            {
                "$match" :{
                    "orderStatus" : "Processing"
                }
            },{
                "$group" :{
                    _id :"",
                    count :{
                        "$sum" : 1 
                    }
                }
            }

        ])
        const shippedOrders = await OrderModel.aggregate([
            {
                "$match" :{
                    "orderStatus" : "Shipped"
                }
            },{
                "$group" :{
                    _id :"",
                    count :{
                        "$sum" : 1 
                    }
                }
            }

        ])

        const ActiveBuyers = await BuyerModel.aggregate([
            {
                "$match" : {
                    "userStatus"  : "active"
                }
            },{
                "$group" : {
                    _id :"",
                    count :{
                        "$sum" : 1
                    }
                }
            }
        ])

        const ActiveSellers = await SellerModel.aggregate([
            {
                "$match" : {
                    "userStatus"  : "active"
                }
            },{
                "$group" : {
                    _id :"",
                    count :{
                        "$sum" : 1
                    }
                }
            }
        ])


        const revenebyMonths = await OrderModel.aggregate([
            {
                "$group" :{
                    _id :{ year : {"$year" : "$createdAt" },month : {"$month"  : "$createdAt"}},
                    total : {
                        "$sum" : "$totalAmount"
                    }
                }
            },
            
        ])
 
  let graph = [
    {
      type: "Jan",
      sales: 0,
    },
    {
      type: "Feb",
      sales: 0,
    },
    {
      type: "Mar",
      sales: 0,
    },
    {
      type: "Apr",
      sales: 0,
    },
    {
      type: "May",
      sales: 0,
    },
    {
      type: "Jun",
      sales: 0,
    },
    {
      type: "July",
      sales: 0,
    },
    {
      type: "Aug",
      sales: 0,
    },
    {
      type: "Sept",
      sales: 0,
    },
    {
      type: "Oct",
      sales: 0,
    },
    {
      type: "Nov",
      sales: 0,
    },
    {
      type: "Dec",
      sales: 0,
    },
  ];


  revenebyMonths.map((data)=>{
    if(data._id.month === 1){
        graph[0].sales = data.total
    }else if(data._id.month === 2){
        graph[1].sales = data.total
    }else if(data._id.month === 3){
        graph[2].sales = data.total
    }else if(data._id.month === 4){
        graph[3].sales = data.total
    }else if(data._id.month === 5){
        graph[4].sales = data.total
    }else if(data._id.month === 6){
        graph[5].sales = data.total
    }else if(data._id.month === 7){
        graph[6].sales = data.total
    }else if(data._id.month === 8){
        graph[7].sales = data.total
    }else if(data._id.month === 9){
        graph[8].sales = data.total
    }else if(data._id.month === 10){
        graph[9].sales = data.total
    }else if(data._id.month === 11){
        graph[10].sales = data.total
    }else if(data._id.month === 12){
        graph[11].sales = data.total
    }
  })

        return res.status(200).send({
            totalRevenue: TotalRevenue[0]?.total || 0,
            totalActiveBuyers  : ActiveBuyers[0]?.count || 0 ,
            totalActiveSellers  : ActiveSellers[0]?.count || 0,
            totalCompletedOrders  : shippedOrders[0]?.count || 0 ,
            totalPendingOrders  : ProcessOrders[0]?.count || 0,
            graphInfo : graph
         })
    }catch(err){
        res.status(500).send(err.message)
    }
})



module.exports = router;