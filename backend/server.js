require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Socket.io for real-time order updates
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  // Restaurant admin or kitchen joining their specific room
  socket.on('join_restaurant', (restaurantId) => {
    socket.join(restaurantId);
    console.log(`Socket ${socket.id} joined restaurant room ${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// We attach io to the app so routes can access it
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/superadmin', require('./routes/superadmin'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/customer', require('./routes/customer'));

const PORT = process.env.PORT || 5005;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotelqr_saas')
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
