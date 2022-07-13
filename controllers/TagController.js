const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const MySql = require("../server/database");
const BaseController = require("./BaseController");
const RequestHandler = require("../utils/RequestHandler");
const { ObjectId } = require("mongodb");
const Logger = require("../utils/logger");
const config = require("../config");
const auth = require("../utils/auth");
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class TagController extends BaseController {
  static async createTag(req, res) {
    try {
      const reqData = { name: req.body.name, owner: req.decoded.payload.id };
      const schema = Joi.object({
        name: Joi.string().required(),
        owner: Joi.string().required(),
      });
      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(error, 400, "bad Request", "invalid UserId");
      const { name, owner } = value;

      const checkExist = await super.getByOptions("Tag", { name, owner });
      if (checkExist.length > 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid tag name, this tag name already existed"
        )();
      }

      const result = await super.create("Tag", value);

      return requestHandler.sendSuccess(res, `Create Tag`)(result);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }
  static async fetchTags(req, res) {
    try {
      const reqData = { owner: req.params.userId };
      const schema = Joi.object({
        owner: Joi.string().required(),
      });
      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(error, 400, "bad Request", "invalid UserId");
      const { id } = value;

      const checkExist = await super.getByOptions("User", { owner });
      if (checkExist.length > 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid userId. This user does not exist."
        )();
      }

      const result = await super.getByOptions("Tag", { owner });
      return requestHandler.sendSuccess(res, `Fetch Tag`)(result);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async updateTag(req, res) {
    try {
      const reqData = {
        name: req.body.name,
        tagId: req.params.tagId,
        owner: req.decoded.payload.id,
      };
      const schema = Joi.object({
        name: Joi.string().required(),
        owner: Joi.string().required(),
        tagId: Joi.string().required(),
      });
      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(error, 400, "bad Request", "invalid UserId");
      const { name, tagId, owner } = value;

      const checkTag = await super.getByOptions("Tag", {
        _id: ObjectId(tagId),
        owner: owner,
      });
      if (checkTag.length == 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "This tag does not exist."
        )();
      }

      if (checkTag[0].name == name) {
        requestHandler.throwError(
          400,
          "bad request",
          "The original tag name and the tag name to be replaced are the same."
        )();
      }

      const result = await super.updateOne(
        "Tag",
        { _id: ObjectId(tagId) },
        { $set: { name: name } }
      );

      return requestHandler.sendSuccess(res, `Update Tag`)(result);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async deleteTag(req, res) {
    try {
      const reqData = {
        owner: req.decoded.payload.id,
        tagId: req.params.tagId,
      };
      const schema = Joi.object({
        owner: Joi.string().required(),
        tagId: Joi.string().required(),
      });
      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(error, 400, "bad Request", "invalid UserId");
      const { tagId, owner } = value;

      const checkTag = await super.getByOptions("Tag", {
        _id: ObjectId(tagId),
        owner: owner,
      });
      if (checkTag.length == 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "This tag does not exist."
        )();
      }

      const result = await super.deleteById("Tag", tagId);

      return requestHandler.sendSuccess(res, `Delete Tag`)(result.data);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }
}
module.exports = TagController;
