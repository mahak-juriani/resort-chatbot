const { Sequelize } = require('@sequelize/core');
const { SqliteDialect } = require('@sequelize/sqlite3');

const sequelize = new Sequelize({
  dialect: SqliteDialect,
  storage: './db/resort-chatbot.db',
});

// Export the Sequelize instance
module.exports = sequelize;