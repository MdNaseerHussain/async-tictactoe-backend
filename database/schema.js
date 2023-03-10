const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  username: String,
  password: String,
});

const gameSchema = new mongoose.Schema({
  id: String,
  player1: String,
  player2: String,
  board: Array,
  turn: String,
  winner: String,
  date: Date,
});

const User = mongoose.model("User", userSchema);
const Game = mongoose.model("Game", gameSchema);

module.exports = { User, Game };
