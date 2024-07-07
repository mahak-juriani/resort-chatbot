const OpenAI = require('openai');

// Initialize OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
  


// Function to get chat completion from OpenAI
const getOpenAIChatCompletion = async (messages) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });
    return response.data.choices[0].message;
  } catch (error) {
    console.error('Error fetching chat completion from OpenAI:', error);
    throw new Error('Could not fetch chat completion.');
  }
};

module.exports = {
  getOpenAIChatCompletion,
};
