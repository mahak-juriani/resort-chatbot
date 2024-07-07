const Room = require('../db/models/rooms');

// for creating a new room
// Controller for creating a new room
exports.createRoom = async (req, res) => {
  try {

    const { price, isAvailable } = req.body;
    // input validation
    if(!isAvailable || !price){
      res.status(400).send('Availability and pricing value are required')
    }
    const room = await Room.create({ price, isAvailable });
    res.json({ message: 'Room created successfully', room });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// getting all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      attributes: ['price', 'isAvailable']
  });
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

/*
// Controller for getting a room by ID
exports.getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findByPk(roomId);
    if (!room) {
      res.status(404).send('Room not found');
    } else {
      res.json(room);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// updating a room
exports.updateRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { price, isAvailable } = req.body;

    const room = await Room.findByPk(roomId);
    if (!room) {
      res.status(404).send('Room not found');
    } else {
      room.name = name;
      room.price = price;
      room.description = description;
      await room.save();
      res.json({ message: 'Room updated successfully', room });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// deleting a room by ID
exports.deleteRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findByPk(roomId);
    if (!room) {
      res.status(404).send('Room not found');
    } else {
      await room.destroy();
      res.send('Room deleted successfully');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
*/