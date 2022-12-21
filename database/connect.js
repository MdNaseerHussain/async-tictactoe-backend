//connect to mongodb
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const uri = process.env.MONGO_URI;
// console.log(uri);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));
