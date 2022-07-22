#!/usr/bin/env node

/**
 * Module dependencies.
 */

const http = require("http");
const app = require("../server/index");
const Logger = require("../utils/logger");
const logger = new Logger();
const mongoose = require("mongoose");
require("dotenv").config();
mongoose

  .connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@mongodb:27017/admin?authSource=admin&authMechanism=SCRAM-SHA-1`,
    {
      useNewUrlParser: true,
      dbName: "cheolog",
    }
  )
  .then(() => {
    logger.log("MongoDB Connection", "info");
  })
  .catch((error) => {
    console.log(
      `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@mongodb:27017/cheolog?authSource=admin&authMechanism=SCRAM-SHA-1`
    );
    logger.log(error.toString(), "error");
  });

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
    logger.log(error, "error");
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
