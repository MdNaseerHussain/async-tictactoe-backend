require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { connect } = require("./database/connect.js");
const { authenticateToken, loginUser, registerUser } = require("./auth.js");
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

app.get("/auth", authenticateToken, (req, res) => {
  res.status(200).send("Success");
  console.log(req.user);
});

app.post("/login", loginUser);

app.post("/register", registerUser);

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
  socket.on("disconnect", () => {
    console.log(`user disconnected: ${socket.user.username}`);
  });
  socket.on("games page", () => {
    console.log("Fetching games");
  });
});

server.listen(process.env.PORT || 3001, () => {
  console.log("Server Running");
});
