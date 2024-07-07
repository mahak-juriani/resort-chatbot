const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chats");

// const router = express.Router();

router.route("/chat")
    .post(chat);

// Export the router
module.exports = router;