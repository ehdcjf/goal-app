const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const MySql = require("../server/database");
const TagSQL = require("../sql/TagSQL");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const config = require("../config");
const auth = require("../utils/auth");
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class TagController {
  static async fetchTags(req, res) {
    try {
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async createTag(req, res) {
    try {
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async updateTag(req, res) {
    try {
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async deleteTag(req, res) {
    try {
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }
}
module.exports = TagController;
