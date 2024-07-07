const { DataTypes } = require('@sequelize/core');
const sequelize = require('../db');
const Room = require('./rooms');

// Define a model for the 'bookings' table
const Booking = sequelize.define('Booking', {
  roomId: {
    type: DataTypes.INTEGER,
    references: {
      model: Room,
      key: 'id'
    }
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nights: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Export the Booking model
module.exports = Booking;
