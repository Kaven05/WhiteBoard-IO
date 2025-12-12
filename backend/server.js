// server.js - REPLACE WITH THIS FIXED VERSION
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

app.get('/', (req, res) => res.send('hi'));

// Store users by room
const rooms = {}; // { roomCode: [{ socketId, userId, name }] }

io.on('connection', (socket) => {
  console.log('SERVER: connected', socket.id);

  socket.on('userJoined', (data) => {
    console.log('SERVER userJoined', data);
    socket.userId = data.userId;
    socket.userName = data.name || data.userName || 'Guest';
    socket.roomCode = data.roomCode;
    socket.join(data.roomCode);

    // Initialize room if it doesn't exist
    if (!rooms[data.roomCode]) {
      rooms[data.roomCode] = [];
    }

    // FIXED: Remove any existing entries for this userId to prevent duplicates
    rooms[data.roomCode] = rooms[data.roomCode].filter(
      u => u.userId !== data.userId
    );

    // Add user to room
    rooms[data.roomCode].push({
      socketId: socket.id,
      userId: data.userId,
      name: socket.userName,
    });

    // Send confirmation to the user
    socket.emit('userIsJoined', { success: true, roomCode: data.roomCode });

    // Send updated users list to everyone in the room
    io.to(data.roomCode).emit('users-in-room', rooms[data.roomCode]);

    // Notify others that a new user joined
    socket.to(data.roomCode).emit('user-joined-notification', {
      userId: data.userId,
      name: socket.userName,
    });

    console.log(`Room ${data.roomCode} now has ${rooms[data.roomCode].length} users`);
  });

  socket.on('whiteboard-data', (data) => {
    const roomCode = data?.roomCode || socket.roomCode;
    if (!roomCode) return console.warn('server: missing roomCode', data);
    if (data.element) socket.to(roomCode).emit('whiteboard-data', { element: data.element });
    else if (Array.isArray(data.elements)) socket.to(roomCode).emit('whiteboard-data', { elements: data.elements });
  });

  socket.on('chat-message', (data) => {
    console.log('SERVER chat-message', data);
    const roomCode = data?.roomCode || socket.roomCode;
    if (!roomCode) return console.warn('server: missing roomCode for chat', data);
    socket.to(roomCode).emit('chat-message', data);
  });

  socket.on('disconnect', () => {
    console.log('SERVER disconnected', socket.id);
    
    // Remove user from room by socketId
    const roomCode = socket.roomCode;
    if (roomCode && rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter(u => u.socketId !== socket.id);
      
      // Notify others that user left
      socket.to(roomCode).emit('user-left-notification', {
        userId: socket.userId,
        name: socket.userName,
      });

      // Send updated users list
      io.to(roomCode).emit('users-in-room', rooms[roomCode]);

      console.log(`Room ${roomCode} now has ${rooms[roomCode].length} users`);

      // Clean up empty rooms
      if (rooms[roomCode].length === 0) {
        delete rooms[roomCode];
      }
    }
  });
});

server.listen(3000, () => console.log('server listening 3000'));