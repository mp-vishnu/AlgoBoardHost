const { app, server } = require("./app");
const dotenv = require("dotenv");
//const connectDatabase = require("./config/database");

// Load environment variables
dotenv.config({ path: "config/config.env" });

// Connecting to the database
//connectDatabase();

// Start the server (both HTTP and WebSocket)
server.listen(process.env.PORT || 5000, () => {
  console.log(
    `Server is working on http://localhost:${process.env.PORT || 5000}`
  );
});
