var express = require('express');
var router = express.Router();
const message = require("../schemas/message")


//new messsage 
router.post("/sendMessage", async(req, res)=>{

    try{    
        const newMessage = new message(req.body)
        const saveMessage = await newMessage.save();
        res.status(200).send(saveMessage);

    }catch(e){
        res.status(400).send(e.message)
    }

});

//send message
router.get("/fetchMessage/:userId", async(req, res)=>{

    try{    
        const fetchMessages = await message.find({
            conversationId : req.params.userId
        })
        res.status(200).send(fetchMessages);

    }catch(e){
        res.status(400).send(e.message)
    }

});

module.exports = router