const Groq = require("groq-sdk");
const uuid = require('uuid');
const express = require('express');

const Chat = require('../db/models/chats');
const Room = require('../db/models/rooms');
const { createBooking } = require("./bookings");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const initialSystemMessage = {
    role: "system",
    content: "Assume you're resort room management system. Once the room is booked it cannot be canceled. User will select by telling a room out of the rooms fetched. You provide pricing information. User confirms they want to proceed with booking. You get details such as fullName, email, nights, roomId. Full name, nights and roomId are mandatory before booking. One room booking at a time. The payment will be done in cash at the resort",
};
// Initiate agent so it acts as resort booking agent
async function initiateChat(startMessage){

    const rooms = await Room.findAll({where: {isAvailable: true},attributes:[['id','roomNumber'],'price'],raw:true})
    let roomDetails = ''
    rooms.forEach((room)=>{
        roomDetails += `Room Number - ${room.roomNumber}, price - ${room.price}`
    })
    console.log(rooms)

    console.log(roomDetails)
    if(!roomDetails){
        roomDetails = 'None'
    }
    startMessage.content+=`Rooms available - ${roomDetails}`

    console.log(startMessage.content)
    return groq.chat.completions.create({
        messages: [startMessage],
        model: "llama3-8b-8192",
      });
    
}

async function getGroqChatCompletion(query, context=[]) {
  return groq.chat.completions.create({
    messages: [
        ...context,
      {
        role:"user",
        content: query,
      }
    ],
    model: "llama3-8b-8192",
  });
}

exports.chat = async (req,res) => {
    const { query } = req.body;
    let {conversationId} = req.body;
    let newConversation = false,
    messages = [];

    // if no query send error
    if(!query){
        return res.status(400).send({ message: 'It seems like you might have sent an empty message by mistake. If you meant to say something, feel free to type it in and I will do my best to help!' });
    }

    if(!conversationId){
        // If no conversation id, create one
        console.log("New conversation started")
        conversationId = uuid.v4();
        newConversation = true;
    }else{
        // validate conversationId to be uuid
        if(!uuid.validate(conversationId)){
            return res.status(400).send({message: "Invalid conversationId provided"})
        }
        // find all conversations with the conversationId createdAt ASC with role, update messages array accordingly 

        messages = await Chat.findAll({
            where : { conversationId },
            order: [
                ['createdAt', 'ASC'],
            ],
            attributes: ['role', ['message','content']],
            raw: true,
        })

        // accordingly update newConversation flag
        if(messages.length == 0){
            console.log("New conv")
            newConversation = true
        }
    }

    if(newConversation){
        // initiate system
        await initiateChat(initialSystemMessage);
        
        // create chat by system
        await Chat.create({conversationId, role:'system', message: initialSystemMessage.content})
        messages.unshift(initialSystemMessage)
    }

    // One word answer based on context : 
    // send latest message - if asking room availability for the resort - say yes
    const isAskingForRooms = await getGroqChatCompletion("if last message is asking room availability for the resort - say yes, else no. Don't say anything else", [{role:"system",content:query}])
    if(isAskingForRooms.choices[0]?.message?.content.toLowerCase().includes("yes")){
        // get room details and update via system role
        console.log("get room details and update via system role")

        const rooms = await Room.findAll({where: {isAvailable: true},attributes:[['id','Room number'],'price'],raw:true})
        let message = '';
        message.content+=`Rooms available - ${JSON.stringify(rooms)}`
        
        await getGroqChatCompletion(message, [{role:"system",content:query}])

    }else{
        console.log("not isAskingForRooms")
        console.log(isAskingForRooms.choices[0]?.message?.content)
    }

    // One word answer based on context : 
    // send latest message - if room number provided for the booking - say yes
    let isRoomNumberProvided = await getGroqChatCompletion("is room number to be booked provided? say yes, else no. Don't say anything else", [...messages,{role:"system",content:query}])
    isRoomNumberProvided = isRoomNumberProvided.choices[0]?.message?.content.toLowerCase().includes("yes");
    console.log('isRoomNumberProvided',isRoomNumberProvided)
    
    let isFullNameProvided = await getGroqChatCompletion("is full Name of the customer provided? say yes, else no. Don't say anything else", [...messages,{role:"system",content:query}]);
    isFullNameProvided = isFullNameProvided.choices[0]?.message?.content.toLowerCase().includes("yes");
    console.log('isFullNameProvided',isFullNameProvided)
    
    let isNightsToStayProvided = await getGroqChatCompletion("is nights to stay provided? say yes, else no. Don't say anything else", [...messages,{role:"system",content:query}]);
    isNightsToStayProvided = isNightsToStayProvided.choices[0]?.message?.content.toLowerCase().includes("yes");
    console.log('isNightsToStayProvided',isNightsToStayProvided)
    
    let isBookingARoom = await getGroqChatCompletion("is last few queries confirming to booking a room?", [...messages,{role:"system",content:query}])
    isBookingARoom = isBookingARoom.choices[0]?.message?.content.toLowerCase().includes("yes");
    console.log('isBookingARoom',isBookingARoom)

    // If all booking details provided, book the room
    if(
        isBookingARoom && 
        isFullNameProvided &&
        isNightsToStayProvided
    ){
        console.log("book room and update via system role")
        // book room and update via system role
        req.url = '/book'
        req.body.fullName = (await getGroqChatCompletion("Please respond with full name, nothing else", [...messages,{role:"system",content:query}])).choices[0]?.message?.content
        
        req.body.email = (await getGroqChatCompletion("Please respond with email, nothing else", [...messages,{role:"system",content:query}])).choices[0]?.message?.content;
        req.body.roomId = (await getGroqChatCompletion("Please respond with roomId, nothing else", [...messages,{role:"system",content:query}])).choices[0]?.message?.content;
        req.body.nights = (await getGroqChatCompletion("Please respond with number of nights stay in numeric, nothing else", [...messages,{role:"system",content:query}])).choices[0]?.message?.content;

        return createBooking(req,res)

    }else{
        console.log("not isBookingARoom")

        console.log(isBookingARoom)
    }

    const chatCompletion = await getGroqChatCompletion(query, messages);
    const assistantResponse = chatCompletion.choices[0]?.message?.content || ""

    // Print the completion returned by the LLM.
    console.log("assistantResponse:", assistantResponse);

    // create chat by user
    await Chat.create({conversationId, role:'user', message: query})

    // create chat by assistant
    await Chat.create({conversationId, role:'assistant', message: assistantResponse})

    chatCompletion.conversationId = conversationId;

    // console.log(req.body)
    res.json({ message: 'Chat created successfully', chatCompletion });
}
