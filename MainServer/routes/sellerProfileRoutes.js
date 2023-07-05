var express = require('express');
var router = express.Router();
const path = require('path');
const upload = require("../middleWare/multer");
const resize = require('../middleWare/resize');
const sellerProfile = require("../schemas/sellerProfileSchema")
const auth = require("../middleWare/auth")
const OrderModel = require("../schemas/orderSchema")

router.post('/addProduct', upload.single('image'), auth, async (req, res) => {
  try {
    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new resize(imagePath);
    if (!req.file)
      return res.status(400).json({ error: 'Please provide an image' });

    const filename = await fileUpload.save(req.file.buffer);

    const image = "/images/" + filename;

    const result = await sellerProfile.updateOne({
      "sellerProfileId": req.body.sellerId
    }, {
      "$push": {
        "products": {
          "productName": req.body.productName,
          "ProductImage": image,
          "productDetail": req.body.productDetail,
          "productAmount": req.body.productAmount,
          "productCategory": req.body.category,
          "productStatus": req.body.status
        }
      }
    })
    res.status(200).send("data is saved")
    console.log(result);
  } catch (err) {
    console.log(err.message);
    res.status(400).send(err.messsage);
  }
});



router.get("/deleteItem", auth, async (req, res) => {
  try {
    const result = await sellerProfile.updateOne({ sellerProfileId: req.query.sellerId }, {
      "$pull": {
        "products": {
          "_id": req.query.productId
        }
      }
    })
    res.status(200).send(result)
  } catch (e) {
    res.status(400).send(e.message)
    console.log(e.message)
  }
})


router.post("/searchData", auth, async (req, res) => {
  try {

    if (!req.query.key && !req.query.Category) {
      const result = await sellerProfile.aggregate([{
        "$unwind": "$products"
      }
      ])
      console.log("!req.query.key  && !req.query.Category")
      console.log(result)
      return res.status(200).send(result)
    } else if (req.query.key && req.query.Category) {
      console.log("req.query.key  && req.query.Category")
      const result = await sellerProfile.aggregate([
        {
          "$unwind": "$products"
        }, {
          "$match": {
            "$and": [{ "products.productName": { $regex: req.query.key } }, { "products.productCategory": { $regex: req.query.Category } }]

          }
        }
      ]);
      // console.log(result)
      return res.status(200).send(result);
    } else if (req.query.key && !req.query.Category) {
      console.log("req.query.key && !req.query.Category")
      const result = await sellerProfile.aggregate([
        {
          "$unwind": "$products"
        }, {
          "$match": {
            "products.productName": { $regex: req.query.key }
          }
        }
      ]);
      console.log(result)
      return res.status(200).send(result);
    } else if (!req.query.key && req.query.Category) {
      const result = await sellerProfile.aggregate([
        {
          "$unwind": "$products"
        }, {
          "$match": {
            "products.productCategory": { $regex: req.query.Category }
          }
        }
      ]);
      console.log(result)
      return res.status(200).send(result);
    }
    res.status(200).send("true")
  } catch (err) {
    res.status(400).send(err.message);
    console.log(err.message)
  }
})


router.get("/getAllItems/:id", auth, async (req, res) => {
  try {
    const result = await sellerProfile.find({ sellerProfileId: req.params.id }).populate("products");
    res.status(200).send(result)
  } catch (e) {
    res.status(400).send(e.message);
  }
})


//get all product of sellers
router.get("/getAllProducts", auth, async (req, res) => {
  try {
    const result = await sellerProfile.find({}).populate("products");
    console.log(result)
    console.log(result)
    res.status(200).send(result)
  } catch (e) {
    res.status(400).send(e.message);
  }
})

router.get("/getAllReviews/:id", auth, async (req, res) => {
  try {
    const result = await sellerProfile.find({ sellerProfileId: req.params.id }).populate("reviews");
    res.status(200).send(result)
  } catch (e) {
    res.status(400).send(e.message);
  }
})

router.get("/getSellerDashBoardInfo/:id", async (req, res) => {
  try {
    const result = await sellerProfile.find({ sellerProfileId: req.params.id }).populate("reviews");
    // res.status(200).send(result)

    const TotalRevenue = await OrderModel.aggregate([
      {
        "$match": {
          "sellerId": req.params.id
        }
      },
      {
        "$group": {
          _id: "",
          total: {
            "$sum": "$totalAmount"
          },
          totalOrder: {
            "$sum": 1
          }
        }
      }

    ])

    const completeOrder = await OrderModel.aggregate([
      {
        "$match": {
          "$and": [{ "sellerId": req.params.id }, { "orderStatus": "Shipped" }]
        }
      }, {
        "$group": {
          _id: "",
          completeOrder: {
            "$sum": 1
          }
        }
      }
    ])

    const revenebyMonths = await OrderModel.aggregate([
      {
        "$match": {
          "sellerId": req.params.id
        }
      },
      {
        "$group": {
          _id: { year: { "$year": "$createdAt" }, month: { "$month": "$createdAt" } },
          total: {
            "$sum": "$totalAmount"
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


    revenebyMonths.map((data) => {
      if (data._id.month === 1) {
        graph[0].sales = data.total
      } else if (data._id.month === 2) {
        graph[1].sales = data.total
      } else if (data._id.month === 3) {
        graph[2].sales = data.total
      } else if (data._id.month === 4) {
        graph[3].sales = data.total
      } else if (data._id.month === 5) {
        graph[4].sales = data.total
      } else if (data._id.month === 6) {
        graph[5].sales = data.total
      } else if (data._id.month === 7) {
        graph[6].sales = data.total
      } else if (data._id.month === 8) {
        graph[7].sales = data.total
      } else if (data._id.month === 9) {
        graph[8].sales = data.total
      } else if (data._id.month === 10) {
        graph[9].sales = data.total
      } else if (data._id.month === 11) {
        graph[10].sales = data.total
      } else if (data._id.month === 12) {
        graph[11].sales = data.total
      }
    })

    res.status(200).send({
      totalRevenue: TotalRevenue[0]?.total || 0,
      totalorder: TotalRevenue[0]?.totalOrder || 0,
      completedOrder: completeOrder[0]?.completeOrder || 0,
      graphInfo: graph
    });

  } catch (e) {
    res.status(400).send(e.message);
  }
})




module.exports = router;