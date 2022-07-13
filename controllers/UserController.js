const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const config = require("../config");
const auth = require("../utils/auth");
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class UserController {
  static async fetchUserById(req, res) {
    try {
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async updateUser(req, res) {
    try {
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async removeUser(req, res) {
    try {
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }
}
module.exports = UserController;
