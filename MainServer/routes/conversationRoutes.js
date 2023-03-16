var express = require('express');
var router = express.Router();
const conversation = require("../schemas/Conversation")


//new Conversation 

router.post("/newConversation", async(req, res)=>{

    const newConversation = new conversation({
        members : [req.body.senderId, req.body.receiverId]
    });

    try{
        const saveConversation = await newConversation.save();
        res.status(200).send(saveConversation);

    }catch(e){
        res.status(400).send(e.message)
    }

});


router.get("/conversation/:userId", async(req, res)=>{
    try{
        const fetchConverstion = await conversation.find({
            members :{ $in: [req.params.userId]}
        })
        res.status(200).send(fetchConverstion)

    }catch(e){
        res.status(400).send(e.message)
    }

});






module.exports = router