require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { connect } = require("./database/connect.js");
const User = require("./database/schema.js").User;
const Game = require("./database/schema.js").Game;

app.use(express.json());
app.use(cors());

//connect to database
connect();

app.get("/auth", authenticateToken, (req, res) => {
  res.status(200).send("Success");
  console.log(req.user);
});

// app.get("/users", authenticateToken, (req, res) => {
//   res.json(users);
// });

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("Unauthorized");
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send("Forbidden");
    req.user = user;
    next();
  });
}

app.post("/login", async (req, res) => {
  //get user from database based on username
  console.log("im here");
  var user;
  await User.findOne({ username: req.body.username }, function (err, result) {
    user = result;
  });

  if (user == null) {
    return res.status(400).send("Cannot find user");
  }

  try {
    if (bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      console.log("sujith 3");
      res.status(200).json({ accessToken: accessToken });
    } else {
      res.status(400).send("Incorrect username or password");
    }
  } catch {
    console.log("sujith 4");
    res.status(500).send("Error here");
  }
});

app.post("/register", async (req, res) => {
  //get user from database based on username
  console.log("sujith 1");
  const user = await User.findOne({
    username: req.body.username,
  });
  console.log("sujith 2");
  const email = await User.findOne({
    email: req.body.email,
  });
  console.log(email);
  if (email !== null) {
    return res.status(400).send("Email already exists");
  }
  console.log("sujith 4");
  if (user !== null) {
    return res.status(400).send("Username already exists");
  }
  try {
    console.log("sujith 5");
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      id: uuid.v4(),
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
    };
    //push user to database
    const newUser = new User(user);
    newUser.save();

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.status(201).json({ accessToken: accessToken });
    console.log("register done");
  } catch {
    res.status(500).send("server Error");
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server Running");
});

// accept get request at http://localhost:3001/gamesList
app.get("/gamesList", authenticateToken, (req, res) => {
  console.log("im here");
  var user = req.username;
  //get all games from database where player1 or player2 is username
  Game.find(
    { $or: [{ player1: user }, { player2: user }] },
    function (err, games) {
      if (err) {
        console.log(err);
      } else {
        res.json(games);
      }
    }
  );
});
