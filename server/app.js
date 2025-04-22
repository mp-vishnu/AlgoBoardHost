// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const dotenv = require("dotenv");
const {
  userJoin,
  getUsers,
  userLeave,
  addUser,
  removeUserFromRoom,
  getUsersInRoom,
} = require("./utils/user");

// Load environment variables
dotenv.config({ path: "config/config.env" });

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins, or specify your frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

const basic = require("./router/basicRouter");
app.use("/", basic);

// Whiteboard data storage per room
const roomWhiteboardData = {}; // { roomId: imgURL }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("userJoined", (data) => {
    const { name, userId, roomId, host, presenter } = data;
    socket.join(roomId);

    const users = addUser({ ...data, socketId: socket.id });
    io.to(roomId).emit("userIsJoined", { success: true, users });
    socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);

    // Send whiteboard data if exists
    if (roomWhiteboardData[roomId]) {
      socket.emit("whiteBoardDataResponse", {
        imgURL: roomWhiteboardData[roomId],
      });
    }
  });

  socket.on("whiteboardData", ({ imgURL, roomId }) => {
    roomWhiteboardData[roomId] = imgURL;
    socket.broadcast.to(roomId).emit("whiteBoardDataResponse", { imgURL });
  });

  socket.on("leaveRoom", ({ roomId }) => {
    const { user } = removeUserFromRoom(socket.id, roomId);
    if (user) {
      socket.broadcast.to(roomId).emit("userLeftMessageBroadcasted", user.name);
    }

    const users = getUsersInRoom(roomId);
    if (users.length === 0) {
      console.log(`Room ${roomId} is now empty.`);
    } else {
      io.to(roomId).emit("userIsJoined", { success: true, users });
    }

    socket.leave(roomId);
  });

  // Handle reconnect event
  socket.on("reconnectUser", (data) => {
    const { roomId, userId, name } = data;
    socket.join(roomId);
    const users = getUsersInRoom(roomId);
    io.to(roomId).emit("userIsJoined", { success: true, users });
    socket.emit("userRejoined", { userId, name });
    socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);
  });

  // ✅ REAL-TIME CHAT EVENTS
  socket.on("sendMessage", ({ roomId, messageData }) => {
    // Broadcast to everyone in the room
    socket.broadcast.to(roomId).emit("receiveMessage", messageData); // Send to other users
    socket.emit("receiveMessage", messageData); // Send to the sender as well
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    const roomsToUpdate = removeUserFromRoom(socket.id);
    roomsToUpdate.forEach(({ roomId, user }) => {
      if (user) {
        socket.broadcast
          .to(roomId)
          .emit("userLeftMessageBroadcasted", user.name);
      }

      const users = getUsersInRoom(roomId);
      if (users.length > 0) {
        io.to(roomId).emit("userIsJoined", { success: true, users });
      }
    });
  });
});

module.exports = { app, server };
