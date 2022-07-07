const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const MySql = require("../server/database");
const TagSQL = require("../sql/TagSQL.js");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const config = require("../config");
const auth = require("../utils/auth");
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class TagController {
  static async fetchTags(req, res) {
    try {
      const reqData = { id: req.params.userId };
      const schema = Joi.object({
        id: Joi.string().required(),
      });
      const { value } = schema.validate(reqData);
      requestHandler.validateJoi(value, 400, "bad Request", "invalid UserId");
      const { id, name, pw } = value;
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async createTag(req, res) {
    try {
      const reqData = req.body;
      const owner = req.decoded.payload.uuid;
      const schema = Joi.object({
        name: Joi.string().required(),
      });
      const { value } = schema.validate(reqData);
      requestHandler.validateJoi(value, 400, "bad Request", "invalid UserId");
      const { name } = value;

      const checkSql = TagSQL.checkExistByName(owner, name);
      const checkExist = await MySql.query(checkSql);
      if (checkExist.length > 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid tag name, this tag name already existed"
        )();
      }

      const createSql = TagSQL.createNewTag();
      const createParams = [owner, name];
      const result = await MySql.execute(createSql, createParams);

      return requestHandler.sendSuccess(
        res,
        `Create Tag: ${name}`
      )(result.data);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async updateTag(req, res) {
    try {
      const reqData = { ...req.body, ...req.params };
      const owner = req.decoded.payload.uuid;
      const schema = Joi.object({
        name: Joi.string().required(),
        tagId: Joi.string().required(),
      });
      const { value } = schema.validate(reqData);
      requestHandler.validateJoi(value, 400, "bad Request", "invalid UserId");
      const { name, tagId } = value;

      const checkSql = TagSQL.checkExistById(owner, tagId);
      const checkExist = await MySql.query(checkSql);
      if (checkExist.length == 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "This tag does not exist."
        )();
      }

      const updateSql = TagSQL.updateTag();
      const updateParams = [name, tagId];
      const result = await MySql.execute(updateSql, updateParams);

      return requestHandler.sendSuccess(
        res,
        `Create Tag: ${name}`
      )(result.data);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async deleteTag(req, res) {
    try {
      const reqData = { ...req.body, ...req.params };
      const owner = req.decoded.payload.uuid;
      const schema = Joi.object({
        name: Joi.string().required(),
        tagId: Joi.string().required(),
      });
      const { value } = schema.validate(reqData);
      requestHandler.validateJoi(value, 400, "bad Request", "invalid UserId");
      const { name, tagId } = value;

      const checkSql = TagSQL.checkExistById(owner, tagId);
      const checkExist = await MySql.query(checkSql);
      if (checkExist.length == 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "This tag does not exist."
        )();
      }

      const sql = TagSQL.deleteTag();
      const params = [name, tagId];
      const result = await MySql.execute(sql, params);

      return requestHandler.sendSuccess(
        res,
        `Create Tag: ${name}`
      )(result.data);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }
}
module.exports = TagController;
