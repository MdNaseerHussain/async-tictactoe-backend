const bcrypt = require("bcrypt");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("../database/schema.js").User;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("Unauthorized");
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send("Forbidden");
    req.user = user;
    next();
  });
};

const loginUser = async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
  }).then((res) => res.toJSON());
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({ accessToken: accessToken });
    } else {
      res.status(400).send("Incorrect username or password");
    }
  } catch {
    res.status(500).send("Internal Server Error");
  }
};

const registerUser = async (req, res) => {
  if (!/^[a-zA-Z0-9]+$/.test(req.body.username)) {
    return res
      .status(400)
      .send("Username must contain only alphanumeric characters");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return res.status(400).send("Invalid email");
  }
  const user = await User.findOne({
    username: req.body.username,
  }).then((res) => res && res.toJSON());
  const email = await User.findOne({
    email: req.body.email,
  }).then((res) => res && res.toJSON());
  if (user) {
    return res.status(400).send("Username already exists");
  }
  if (email) {
    return res.status(400).send("Email already exists");
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      id: uuid.v4(),
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
    };
    const newUser = new User(user);
    newUser.save();
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.status(201).json({ accessToken: accessToken });
  } catch {
    res.status(500).send("Internal Server Error");
  }
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({
    email: email,
  }).then((res) => res && res.toJSON());
  return user;
};

module.exports = { authenticateToken, loginUser, registerUser, getUserByEmail };
