const express = require("express");
const { 
    createRoom, 
    getAllRooms, 
    // getRoomById, 
    // updateRoomById,
    // deleteRoomById
} = require("../controllers/rooms");

const router = express.Router();

// router.route("/rooms")
    // Get all rooms
    // .get(getAllRooms)
    // Create a new room
    // .post(createRoom);
// router.route("/rooms/:id")
// //     // Get a room by id
//     .get(getRoomById)
// //     // Update a room by id
//     .put(updateRoomById)
// //     // Delete a room by id
//     .delete(deleteRoomById)
// Export the router

router.get('/rooms', getAllRooms); // Example GET route
router.post('/rooms', createRoom); // Example POST route


module.exports = router;