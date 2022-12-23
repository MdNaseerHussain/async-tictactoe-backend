require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { connect } = require("./database/connect.js");
const {
  authenticateToken,
  loginUser,
  registerUser,
  getUserByEmail,
} = require("./services/auth.js");
const {
  fetchUserGames,
  createGame,
  updateGame,
} = require("./services/games.js");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

connect();

app.post("/login", loginUser);
app.post("/register", registerUser);
app.get("/games", authenticateToken, fetchUserGames);
app.get("/game/:id", authenticateToken, updateGame);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      socket.user = user;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
}).on("connection", (socket) => {
  console.log(`user connected: ${socket.user.username}`);
  socket.join(socket.user.username);
  socket.on("disconnect", () => {
    console.log(`user disconnected: ${socket.user.username}`);
  });
  socket.on("new game", async (email, callback) => {
    console.log(`new game request from ${socket.user.username}`);
    const player1 = socket.user;
    const player2 = await getUserByEmail(email);
    if (!player2) {
      callback({ message: "User not found" });
      return;
    }
    if (player1.username === player2.username) {
      callback({ message: "Cannot play against yourself" });
      return;
    }
    const game = await createGame(player1.username, player2.username);
    if (game.error) {
      callback({ message: game.error });
      return;
    }
    callback({
      id: game.id,
      player1: player1.username,
      player2: player2.username,
      turn: game.turn,
      email: player2.email,
      date: game.date,
    });
    sendGameUpdate(player2.username, game.id);
  });
});

const sendGameUpdate = (username, gameId) => {
  io.to(username).emit("game update", {
    gameId: gameId,
  });
};

server.listen(process.env.PORT || 3001, () => {
  console.log("Server Running");
});
