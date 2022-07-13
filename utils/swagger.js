const express = require("express");

const router = express.Router();

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const config = require("../config");

const directoryPath = path.join(__dirname, "../router/api");
const pathes = [];

const filesName = fs.readdirSync(directoryPath, (err, files) => {
  // handling error
  if (err) {
    return console.log(`Unable to scan directory: ${err}`);
  }
  // listing all files using forEach
  return files.forEach((file) => pathes.push(file));
});

function getFullPathes(names) {
  names.forEach((name) => {
    let customePath;
    if (name !== "index") {
      customePath = `./router/api/${name}`;
    }
    if (!_.isUndefined(name)) {
      pathes.push(customePath);
    }
  });
}

getFullPathes(filesName);
const options = {
  swaggerDefinition: {
    info: {
      open_api_version: "3.0.3",
      title: "cheolog API",
      version: "2.0.0",
      description: "Controller for Cheolog API Calls are defined here",
      contact: {
        email: "kdch0823@naver.com",
      },
    },
    tags: [
      {
        name: "User",
        description: "Users API",
      },
      {
        name: "Auth",
        description: "Authentication apis",
      },
      {
        name: "Goal",
        description: "for setting Goal ",
      },
    ],
    schemes: ["http", "https"],
    host: `localhost:${config.app.port}`,
    basePath: "/api/v1/",
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        description: "JWT authorization of an API",
        name: "Authorization",
        in: "header",
      },
    },
  },
  apis: pathes,
};
const swaggerSpec = swaggerJSDoc(options);
require("swagger-model-validator")(swaggerSpec);

router.get("/json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function validateModel(name, model) {
  const responseValidation = swaggerSpec.validateModel(
    name,
    model,
    false,
    true
  );
  if (!responseValidation.valid) {
    throw new Error("Model doesn't match Swagger contract");
  }
}

module.exports = {
  router,
  validateModel,
};
