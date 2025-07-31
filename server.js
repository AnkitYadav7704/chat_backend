const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://chat-frontend-xi-drab.vercel.app',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000'], // ✅ Update with frontend domain in production
  methods: ['GET', 'POST'],
  credentials: true
}));
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const Message = require('./models/Message');

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('send-message', async (data) => {
    const msg = new Message({ text: data.text, sender: data.sender });
    await msg.save();
    io.emit('receive-message', msg); // Send to all
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));
