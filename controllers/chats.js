// const Groq = require("groq-sdk");
const { getAvailableRooms, bookRoom } = require('./api'); // Import the functions
const { getOpenAIChatCompletion } = require('./openai'); // Import OpenAI functions
const uuid = require('uuid');
const express = require('express');

const Chat = require('../db/models/chats');
const Room = require('../db/models/rooms');
const { createBooking } = require("./bookings");

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const initialSystemMessage = {
    role: "system",
    content: "Assume you're resort room management system. Once the room is booked it cannot be canceled. User will select by telling a room out of the rooms fetched. You provide pricing information. User confirms they want to proceed with booking. You get details such as fullName, email, nights, roomId. Full name, nights and roomId are mandatory before booking. One room booking at a time. The payment will be done in cash at the resort. Do not answer any questions not related to our resort booking. Assume you only know the details about the resort.",
};

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
        console.log("New conversation started.")
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
            console.log("New conversation.")
            newConversation = true
        }
    }

    if(newConversation){
        // // initiate system
        // await initiateChat(initialSystemMessage);
        
        // // create chat by system
        // await Chat.create({conversationId, role:'system', message: initialSystemMessage.content})
        // messages.unshift(initialSystemMessage)


        const rooms = await getAvailableRooms();
        let roomDetails = '';
        rooms.forEach(room => {
        roomDetails += `Room Number - ${room.id},  description - ${room.description}, price - ${room.price}.`;
        });
        initialSystemMessage.content += `Rooms available - ${roomDetails}`;
        await getOpenAIChatCompletion([initialSystemMessage]);
        await Chat.create({ conversationId, role: 'system', message: initialSystemMessage.content });
        messages.unshift(initialSystemMessage);
    }

    const isAskingForRooms = await getOpenAIChatCompletion([
        { role: "user", content: query },
        { role: "system", content: "Is the user asking for list of all rooms?, only say yes or no, nothing else" }
    ]);
    if (isAskingForRooms.content.toLowerCase().includes("yes")) {
        const rooms = await getAvailableRooms();
        let message = '';
        message += `Rooms available - ${JSON.stringify(rooms)}`;
        const roomDetailsByOpenAI = await getOpenAIChatCompletion([{ role: "system", content: message }]);
        // return roomDetails
        return res.json({ message: 'Room Details', booking: roomDetailsByOpenAI, conversationId });
    }

    const isRoomNumberProvided = await getOpenAIChatCompletion([
        ...messages,
        { role: "system", content: query },
        { role: "user", content: "Do we know which room to book finally?, answer in yes or no, nothing else" }
      ]);
      const isFullNameProvided = await getOpenAIChatCompletion([
        ...messages,
        { role: "user", content: query },
        { role: "system", content: "Do we know full name of the user?, answer in yes or no, nothing else" }
      ]);
      const isNightsToStayProvided = await getOpenAIChatCompletion([
        ...messages,
        { role: "user", content: query },
        { role: "system", content: "Are nights to stay for the booking provided by the user?, answer in yes or no, nothing else" }
      ]);
      const isBookingARoom = await getOpenAIChatCompletion([
        ...messages,
        { role: "user", content: query },
        { role: "system", content: "Has the user confirmed a booking?, answer in yes or no, nothing else" }
      ]);


    if (isBookingARoom.content.toLowerCase().includes("yes") && isFullNameProvided.content.toLowerCase().includes("yes") && isNightsToStayProvided.content.toLowerCase().includes("yes") && isRoomNumberProvided.content.toLowerCase().includes("yes")) {
        const fullName = (await getOpenAIChatCompletion([...messages, { role: "system", content: query }, { role: "user", content: "Please respond with full name, no other text" }])).content;
        const email = (await getOpenAIChatCompletion([...messages, { role: "system", content: query }, { role: "user", content: "Please respond with email, only email no other text" }])).content;
        const roomId = (await getOpenAIChatCompletion([...messages, { role: "system", content: query }, { role: "user", content: "Please respond with room ID, numeric value nothing else" }])).content;
        const nights = (await getOpenAIChatCompletion([...messages, { role: "system", content: query }, { role: "user", content: "Please respond with number of nights stay in numeric, nothing else" }])).content;
    
        // validate data before booking, if incorrect ask for details
        let requiredDetails ='';
        if(!parseInt(nights)){
            requiredDetails += 'nights';
        }

        const rooms = await getAvailableRooms();
        const roomIds = [];
        rooms.forEach(room =>{
            roomIds.push(room.id)
        })
        // roomId validation
        if(!roomIds.includes(roomId)){
            requiredDetails && (requiredDetails += ',');
            requiredDetails += 'room id'
        }

        if(requiredDetails){
            const assistantResponse = await getOpenAIChatCompletion([
                ...messages,
                { role: "user", content: query },
                { role: "system", content: `Please request the user to provide the following details - ${requiredDetails}.` }
              ]);
            return res.json({
                message: `${assistantResponse.content} - ${requiredDetails}`
            });
        }else{
            const bookingResponse = await bookRoom(roomId, fullName, email, nights);
    
            await Booking.create({ roomId, fullName, nights, email });
        
            return res.json({ message: 'Booking created successfully', booking: bookingResponse });
        }
        
    }

    const chatCompletion = await getOpenAIChatCompletion([...messages, { role: "user", content: query }]);
    const assistantResponse = chatCompletion.content || "";

    await Chat.create({ conversationId, role: 'user', message: query });
    await Chat.create({ conversationId, role: 'assistant', message: assistantResponse });

    chatCompletion.conversationId = conversationId;

    return res.json({
        message: chatCompletion.content,
        role: chatCompletion.role,
        conversationId: chatCompletion.conversationId  
    });
}
