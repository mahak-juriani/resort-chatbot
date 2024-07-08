const express = require('express')

const dotenv = require('dotenv');
dotenv.config();

const db = require('./db/db.js')
const chatRoutes = require('./routes/chats.js')

const app = express()
const port = 8080

// Sync the model with the database
db.sync().then(() => {
    console.log('Database synchronized');
  });

app.use(express.json());

// Use chat routes
app.use(chatRoutes);

app.post('/chat')

app.get('/', (req, res) => {
  res.send('Server is up')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})