const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const uri = process.env.MONGO_URI;

function connect() {
  mongoose.set("strictQuery", false);
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on("error", (error) => console.error(error));
  db.once("open", () => console.log("Connected to Database"));
}

module.exports = { connect };
