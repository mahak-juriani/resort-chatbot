const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chats");

router.route("/chat")
    .post(async (req, res)=>{
        try{
            await chat(req, res)
        }catch(error){
            console.log(error)
            // TODO: mark conversation as closed, initiate context for new conversation if required
            res.status(400).send({
                message: "Sorry I could not understand, could you please start again"
            })
        }
    });

// Export the router
module.exports = router;