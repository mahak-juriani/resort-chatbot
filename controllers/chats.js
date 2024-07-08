// const Groq = require("groq-sdk");
const { getAvailableRooms, bookRoom } = require('./api'); // Import the functions
const { getOpenAIChatCompletion } = require('./openai'); // Import OpenAI functions
const uuid = require('uuid');

const Chat = require('../db/models/chats');

const initialSystemChat = {
    role: "system",
    content: "Assume you're resort room management system. Once the room is booked it cannot be canceled. User will select by telling a room out of the rooms fetched. You provide pricing information. User confirms they want to proceed with booking. You get details such as fullName, email, nights, room number. Full name, email, nights and room number are mandatory before booking. One room booking at a time. The payment will be done in cash at the resort. Do not answer any questions not related to our resort booking. Assume you only know the details about the resort.",
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
            attributes: ['role', 'content'],
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
        const rooms = await getAvailableRooms();
        let roomDetails = '';
        rooms.forEach(room => {
        roomDetails += `Room Number - ${room.id},  description - ${room.description}, price - ${room.price}.`;
        });
        initialSystemChat.content += `Rooms available - ${roomDetails}`;
        
        initialSystemChat.conversationId = conversationId;

        await Chat.create(initialSystemChat);

        const initialResponse = await getOpenAIChatCompletion([initialSystemChat],conversationId);
        
        messages.unshift(initialSystemChat, initialResponse);
    }

    // save userChat
    const userChat = { conversationId, role: 'user', content: query }
    messages.push(userChat)
    await Chat.create(userChat);
    const chatCompletion = await getOpenAIChatCompletion([...messages, userChat],conversationId);

    // check whether user is asking for rooms
    const isAskingForRooms = await getOpenAIChatCompletion([
        ...messages,
        { role: "system", content: "Is the user asking for list of all rooms?, only say yes or no, nothing else" }
    ],conversationId, false);
    if (isAskingForRooms.content.toLowerCase().includes("yes")) {
        const rooms = await getAvailableRooms();
        let roomDetails = '';
        let message = '';
        rooms.forEach(room => {
            roomDetails += `Room Number - ${room.id},  description - ${room.description}, price - ${room.price}.`;
        });
        message += `Rooms available - ${roomDetails}`;
        const roomDetailsByOpenAI = await getOpenAIChatCompletion([{ role: "system", content: message }],conversationId);
        // return roomDetails
        return res.json({ message: roomDetailsByOpenAI.content, conversationId });
    }

    const isRoomNumberProvided = await getOpenAIChatCompletion([
        ...messages,
        { role: "system", content: "Do we know which room to book finally?, answer in yes or no, nothing else" }
      ],conversationId, false);
      const isFullNameProvided = await getOpenAIChatCompletion([
        ...messages,
        { role: "system", content: "Do we know full name of the user?, answer in yes or no, nothing else" }
      ],conversationId, false);
      const isNightsToStayProvided = await getOpenAIChatCompletion([
        ...messages,
        { role: "system", content: "Are nights to stay for the booking provided by the user?, answer in yes or no, nothing else" }
      ],conversationId, false);
      const isBookingARoom = await getOpenAIChatCompletion([
        ...messages,
        { role: "system", content: "Has the user confirmed a booking?, answer in yes or no, nothing else" }
      ],conversationId, false);


    if (isBookingARoom.content.toLowerCase().includes("yes") && isFullNameProvided.content.toLowerCase().includes("yes") && isNightsToStayProvided.content.toLowerCase().includes("yes") && isRoomNumberProvided.content.toLowerCase().includes("yes")) {
        const fullName = (
            await getOpenAIChatCompletion(
                [
                    ...messages, 
                    { 
                        role: "system", 
                        content: "Please respond with full name, no other text" 
                    }
                ],
                conversationId,
                false
            )
        ).content;

        const email = (
            await getOpenAIChatCompletion(
                [
                    ...messages, 
                    { 
                        role: "system", 
                        content: "Please respond with email, only email no other text" 
                    }
                ],
                conversationId,
                false
            )
        ).content;

        let roomId = (
            await getOpenAIChatCompletion(
                [
                    ...messages, 
                    { 
                        role: "system", 
                        content: "Tell What is the room number  provided by user, no other text" 
                    }
                ],
                conversationId,
                false
            )
        ).content;

        let nights = (
            await getOpenAIChatCompletion(
                [
                    ...messages, 
                    { 
                        role: "system", 
                        content: "Tell What is the number of nights provided by user, no other text" 
                    }
                ],
                conversationId,
                false
            )
        ).content;
    
        // validate data before booking, if incorrect ask for details
        let requiredDetails ='';
        if(!parseInt(nights)){
            console.log('Night details issue', nights)
            requiredDetails += 'nights';
        }else{
            nights = parseInt(nights);
        }

        const rooms = await getAvailableRooms();
        const roomIds = [];
        rooms.forEach(room =>{
            roomIds.push(room.id)
        })
        
        // convert roomId to number
        if(parseInt(roomId)){
            roomId = parseInt(roomId)
        }else{
            // if not convertible to number - pick first number from the string and then perform validation
            roomId = parseInt(roomId.match(/\d+/)[0])
            // roomId validation
            if(!roomIds.includes(roomId)){
                console.log('room details issue', roomId)
                requiredDetails && (requiredDetails += ',');
                requiredDetails += 'room number'
            }
        }

        // TODO: Add email validation

        if(requiredDetails){
            const assistantResponse = await getOpenAIChatCompletion([
                ...messages,
                { role: "system", content: `Please request the user to provide the following details - ${requiredDetails}, and if more details required for booking` }
              ],conversationId);
              messages.push({conversationId,...assistantResponse});
            return res.json({
                message: `${assistantResponse.content}`
            });
        }else{
            const bookingResponse = await bookRoom(roomId, fullName, email, nights);

            return res.json(bookingResponse);
        }
        
    }

    chatCompletion.conversationId = conversationId;

    return res.json({
        message: chatCompletion.content,
        conversationId: chatCompletion.conversationId  
    });
}
