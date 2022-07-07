#!/usr/bin/env node

/**
 * Module dependencies.
 */

const http = require("http");
const app = require("../server/index");
const database = require("../server/database");
const Logger = require("../utils/logger");
// const { dbConnect } = require("../config/databaseConfig");
const logger = new Logger();
const dbinit = database.dbConnect();

// const mongoose = require("mongoose");
// const { schedule, invoiceBatch } = require("../batch/invoice");
// mongoose
// 	.connect(DBCONFIG.MONGO_URI)
// 	.then(() => {
// 		console.log("MongoDB Connection");
// 	})
// 	.catch((error) => {
// 		logger.error(error.toString());
// 		console.log(error);
// 	});

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.DEV_APP_PORT || "3000");
app.set("port", port);
/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.log(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.log(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;

  logger.log(`the server started listining on port ${bind}`, "info");
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
