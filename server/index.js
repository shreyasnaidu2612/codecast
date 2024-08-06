const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./Actions');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://codecast-431705.as.r.appspot.com', // Update with your frontend URL
    methods: ['GET', 'POST'],
    credentials: true, // Set this to true if you need to allow credentials
  },
});

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
};

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    try {
      userSocketMap[socket.id] = username;
      socket.join(roomId);
      const clients = getAllConnectedClients(roomId);
      // Notify that a new user joined
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      });
    } catch (error) {
      console.error('Error handling JOIN event:', error);
    }
  });

  // Sync the code
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    try {
      socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    } catch (error) {
      console.error('Error handling CODE_CHANGE event:', error);
    }
  });

  // When a new user joins the room, sync existing code
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    try {
      io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    } catch (error) {
      console.error('Error handling SYNC_CODE event:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnecting', () => {
    try {
      const rooms = [...socket.rooms];
      // Leave all rooms
      rooms.forEach((roomId) => {
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: userSocketMap[socket.id],
        });
      });

      delete userSocketMap[socket.id];
      socket.leave();
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
