const io = require("socket.io")(8900,{
    cors :{
        origin : "http://localhost:3000"
    }
})

let users = []


const addUser = (userId , socketId)=>{
    if(userId !== null){
        !users.some((user)=>(user.userId === userId)) &&
        users.push({userId , socketId})
        console.log(users)
    }
}

const removeUser = (socketId)=>{
    users = users.filter(user=> user.socketId !== socketId)
    console.log(users)
}


let  getReceiverUser  = (userId) =>{
    return users.find(user => user.userId === userId)
}



io.on("connection", (socket)=>{

    console.log("Connect to user ")

    //send message to client 
    io.emit("wellcome","user is connected to socket Server")

    // //add user to user list
    socket.on("addUser" , (userId)=>{
        addUser(userId,socket.id)
    })

    //Receive message and Send message
    //here socket receive message to socket and send to designated socket
    socket.on("sendMessage",(data)=>{
       senderId = data.senderId;
       text = data.text;
        const receiverUser = getReceiverUser(data.receiverId);
        io.to(receiverUser?.socketId).emit("getMessage",{
            senderId,
            text
        })
    })



    //when user disconnected
    socket.on("disconnection",()=>{
        console.log("a user is disconnected")
        removeUser(socket.id)
    })

})