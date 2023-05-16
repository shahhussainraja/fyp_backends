const jwt = require("jsonwebtoken");
const { collection } = require("../schemas/sellerProfileSchema");

function auth(req,res,next){

 let token = req.header("Authorization");
//  console.log("token is here " + token );
 if (!token) return res.status(401).send(err.message);
 try {
    let user = jwt.verify(token,process.env.jwtkey);
    if(!user)return res.status(401).send(false);
  } catch (err) {
    return res.status(401).send(err.message);
  }
 next();
 
}

module.exports = auth;