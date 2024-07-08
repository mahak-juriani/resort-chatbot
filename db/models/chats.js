const { DataTypes } = require('@sequelize/core');
const sequelize = require('../db');

// Define a model for the 'chats' table
const Chat = sequelize.define('Chat', {
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
        isIn: [['user','assistant','internal-user','internal-assistant', 'system']]
    }
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

// Export the Chat model
module.exports = Chat;