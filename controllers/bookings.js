const Booking = require('../db/models/bookings');


const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// for creating a new room
// Controller for creating a new room
exports.createBooking = async (req, res) => {
  try {
    const { roomId, fullName, nights, email } = req.body;

    if(email && !validateEmail(email)){
      res.status(400).send('Invalid Email');      
    }
    // Add in a transaction
    try{
      // Get Room by id to check if available - provide booking
      const room = await Booking.create({ roomId, fullName, nights, email });
      // Make the room available = false
    }catch(error){
      console.log("Booking Failed");
      console.log(error);

    }
    
    res.json({ message: 'Booking created successfully', room });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};