const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { z } = require("zod");
async function run() {
  await mongoose.connect("mongodb+srv://rajvirgautam8855_db_user:QnMZESmHlMik6j2b@khuranatechnologies.lkwlzwt.mongodb.net/");
  const db = mongoose.connection.useDb("test"); // Try to find the db name
  // Or just query the first Application to see if it loses compensation when updated
  const token = jwt.sign({ id: "650000000000000000000000" }, "dev_secret_key_1234567890abcdef");
  console.log(token);
  process.exit(0);
}
run();
