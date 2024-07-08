const OpenAI = require('openai');
const Chat = require('../db/models/chats');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to get chat completion from OpenAI
const getOpenAIChatCompletion = async (messages, conversationId, toBeSaved=true) => {
    try {

        // TODO: instead of taking complete context as messages array as input, pass the latest required messages only 
        // save the messages passed from user (and system if required) in chats table
        // In order to pass previous messages context to gpt - fetch all messages here everytime from the db Chat.findAll

        // Validate input messages
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error('Invalid or empty messages array.');
        }

        // Define parameters for chat completion request
        const params = {
            messages: messages.map(message=> ({role:message.role, content:message.content})),
            model: 'gpt-3.5-turbo',
        };

        console.log(`${messages[messages.length - 1].role} - ${messages[messages.length - 1].content}`);

        // Call OpenAI API to fetch chat completion
        const chatCompletion = await openai.chat.completions.create(params);

        // console.log('Raw OpenAI API response:', chatCompletion);

        // Check if response is valid and extract completion content
        if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
          const chat_response = chatCompletion?.choices[0]?.message; // Trim leading and trailing whitespace

          console.log(`${messages[messages.length-1].role} requested`,`${chat_response.role} responded with - ${chat_response.content}`)
          // TODO: add assistant response to db
          if(toBeSaved)
            await Chat.create({ conversationId, role: chat_response.role, content: chat_response.content });

          return chat_response;
      } else {
          throw new Error('Empty or invalid response from OpenAI.');
      }
    } catch (error) {
        console.error('Error fetching chat completion from OpenAI:', error);
        throw new Error('Could not fetch chat completion.');
    }
};

module.exports = {
    getOpenAIChatCompletion,
};
