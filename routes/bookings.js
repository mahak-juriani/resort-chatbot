const express = require("express");
const { createBooking } = require("../controllers/bookings");

const router = express.Router();

router.route("/book")
    .post(createBooking);

// Export the router
module.exports = router;