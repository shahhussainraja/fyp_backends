var express = require('express');
var router = express.Router();
const conversation = require("../schemas/Conversation");
const Conversation = require('../schemas/Conversation');


//new Conversation 

router.post("/newConversation", async(req, res)=>{

    try {
        const fetchConverstion = await conversation.find({
        members :{ $in: [req.body.senderId]}
    });
        if(fetchConverstion) {
            for (let  x in  fetchConverstion) {
                let flag    =  fetchConverstion[x].members.includes(req.body.receiverId)
                    if (flag) return res.status(200).send(fetchConverstion[x])
                }
            }

                const newConversation = new conversation({
                members : [req.body.senderId, req.body.receiverId]
                });
                const saveConversation = await newConversation.save();
                return res.status(200).send(saveConversation);
            
          
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