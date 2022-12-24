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
} = require("./services/auth.js");
const {
  fetchUserGames,
  fetchGame,
  createGame,
  updateGame,
} = require("./services/games.js");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT"],
  },
});

app.use(express.json());
app.use(cors());

connect();

app.post("/login", loginUser);
app.post("/register", registerUser);
app.get("/games", authenticateToken, fetchUserGames);
app.get("/game/:id", authenticateToken, fetchGame);
app.put("/game/:id", authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { board } = req.body;
  const updatedGame = await updateGame(id, board);
  if (updatedGame.error) {
    return res.status(400).json({ error: updatedGame.error });
  }
  res.status(200).json({ game: updatedGame });
  sendGameUpdate(updatedGame.player1, id);
  sendGameUpdate(updatedGame.player2, id);
});
app.post("/newgame", authenticateToken, async (req, res) => {
  const { player1, player2 } = req.body;
  const game = await createGame(player1, player2);
  if (game.error) {
    return res.status(400).json({ error: game.error });
  }
  res.status(200).json({ game: game });
  sendGameUpdate(player1, game.id);
  sendGameUpdate(player2, game.id);
});

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
  socket.join(socket.user.username);
});

const sendGameUpdate = (username, id) => {
  io.to(username).emit("game update", { id });
};

server.listen(process.env.PORT || 3001, () => {
  console.log("Server Running");
});
