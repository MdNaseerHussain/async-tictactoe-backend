const mongoose = require("mongoose");
//create user schema
const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  username: String,
  password: String,
});

//create tic tac toe schema
const gameSchema = new mongoose.Schema({
  player1: String, //user 1 id
  player2: String, //user 2 id
  board: Array, //board state
  turn: String, //player 1 or player 2
  winner: String, //game ended or not
});

//create user model
const User = mongoose.model("User", userSchema);

//create game model
const Game = mongoose.model("Game", gameSchema);

module.exports = { User, Game };
