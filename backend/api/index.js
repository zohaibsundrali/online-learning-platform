const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../src/config/database");
const app = require("../src/app");

let connected = false;

module.exports = async (req, res) => {
  if (!connected) {
    await connectDB();
    connected = true;
  }

  return app(req, res);
};