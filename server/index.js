const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const config = require("../config");
const Logger = require("../utils/logger.js");

const logger = new Logger();
const app = express();
app.set("config", config); // the system configrationsx
app.use(bodyParser.json());
app.use(require("method-override")());

if (config.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
const swagger = require("../utils/swagger");

process.on("SIGINT", () => {
  logger.log("stopping the server", "info");
  process.exit();
});

// app.set("db", require("../models/index.js"));
app.set("port", process.env.DEV_APP_PORT);
app.use("/api/docs", swagger.router);

// app.use((req, res, next) => {
// 	req.identifier = uuid();
// 	const logString = `a request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
// 	logger.log(logString, 'info');
// 	next();
// });

app.use(require("../router"));

app.use((req, res, next) => {
  logger.log(
    "the url you are trying to reach is not hosted on our server",
    "error"
  );
  const err = new Error("Not Found");
  err.status = 404;
  res.status(err.status).json({
    type: "error",
    message: "the url you are trying to reach is not hosted on our server",
  });
  next(err);
});

module.exports = app;
