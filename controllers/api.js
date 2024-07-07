const axios = require('axios');

const getAvailableRooms = async () => {
  try {
    const response = await axios.get('https://bot9assignement.deno.dev/rooms');
    return response.data;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw new Error('Could not fetch available rooms.');
  }
};

const bookRoom = async (roomId, fullName, email, nights) => {
  try {
    const response = await axios.post('https://bot9assignement.deno.dev/book', {
      roomId,
      fullName,
      email,
      nights
    });
    return response.data;
  } catch (error) {
    console.error('Error booking room:', error);
    throw new Error('Could not book the room.');
  }
};

module.exports = {
  getAvailableRooms,
  bookRoom
};
