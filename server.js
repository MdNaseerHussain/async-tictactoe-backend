require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

app.use(express.json());

let users = [];

app.get('/users', authenticateToken, (req, res) => {
    res.json(users);
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).send('Unauthorized');
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send('Forbidden');
        req.user = user;
        next();
    });
}

app.post('/login', async (req, res) => {
    const user = users.find(user => user.name === req.body.name);
    if (user == null) {
        return res.status(400).send('Cannot find user');
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.status(200).json({ accessToken: accessToken });
        } else {
            res.status(400).send('Incorrect username or password');
        }
    } catch {
        res.status(500).send('Error');
    }
});

app.post('/register', async (req, res) => {
    const user = users.find(user => user.name === req.body.name);
    if (user != null) {
        return res.status(400).send('User already exists');
    }
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { id: uuid.v4(), name: req.body.name, password: hashedPassword };
        users.push(user);
        res.status(201).send('Success');
    } catch {
        res.status(500).send('Error');
    }
});

app.listen(process.env.PORT || 3001, () => {
    console.log('Server Running');
});
