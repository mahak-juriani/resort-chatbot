const { DataTypes } = require('@sequelize/core');
const sequelize = require('../db');

// Define a model for the 'products' table
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Export the Product model
module.exports = Product;