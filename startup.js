const express = require('express')

const dotenv = require('dotenv');
dotenv.config();

const db = require('./db/db.js')
const roomRoutes = require('./routes/rooms.js')
const bookingRoutes = require('./routes/bookings.js')
const chatRoutes = require('./routes/chats.js')

const app = express()
const port = 3000

// Sync the model with the database
db.sync().then(() => {
    console.log('Database synchronized');
  });

app.use(express.json());

// Use room routes
app.use(roomRoutes);
// Use booking routes
app.use(bookingRoutes);
// Use booking routes
app.use(chatRoutes);


app.post('/chat')

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})