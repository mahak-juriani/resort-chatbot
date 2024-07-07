const axios = require('axios');
const Booking = require('../db/models/bookings');
const Room = require('../db/models/rooms');


const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// for creating a new room

// Controller for creating a new Booking
exports.createBooking = async (req, res) => {
  try {
    const { roomId, fullName, nights, email } = req.body;

    if(email && !validateEmail(email)){
      res.status(400).send('Invalid Email');      
    }

    // Get Room by id to check if available - provide booking
    const room = await Room.findOne({ where: {id:roomId}})
    if(!room){
      return res.json({message:"No such room exists"})
    }
    if(!room.isAvailable){
      console.log(room)
      return res.json({message:"This room is unavailable"})
    }

    // Room is available - create booking
    const booking = await Booking.create({ roomId, fullName, nights, email });
    // Make the room available = false  
    await Room.update({
      isAvailable: false
    },{ 
      where: { id: roomId } 
    })

    // Call the external API to create the booking
    const response = await axios.post('https://bot9assignement.deno.dev/book', {
      roomId,
      fullName,
      email,
      nights
    });


    res.json({ message: 'Booking created successfully', booking, externalResponse: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};