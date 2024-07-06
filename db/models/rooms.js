const { DataTypes } = require('@sequelize/core');
const sequelize = require('../db');

// Define a model for the 'rooms' table
const Room = sequelize.define('Room', {
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});


// Export the Room model
module.exports = Room;