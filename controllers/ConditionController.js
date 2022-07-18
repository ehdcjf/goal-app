const Joi = require("joi");
const _ = require("lodash");
const BaseController = require("./BaseController");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const config = require("../config");
const auth = require("../utils/auth");
const { ObjectId } = require("mongodb");
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class ConditionController extends BaseController {
  static async createCondition(req, res) {
    try {
      const reqData = { ...req.body, owner: req.decoded.payload.id };
      const schema = Joi.object({
        owner: Joi.string().required(),
        name: Joi.string().required(),
      });

      const { value, error } = schema.validate(reqData);

      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Condition Data"
      );
      const { owner, name } = value;

      const checkExist = await super.getByOptions("Condition", { owner, name });
      if (checkExist.length > 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid Condition name, this Condition name already existed"
        )();
      }

      const result = await super.create("Condition", value);
      const retData = { ...result.toObject() };
      retData.conditionId = retData._id;
      delete retData._id;
      delete retData.__v;

      return requestHandler.sendSuccess(res, `Create Condition`)(retData);
    } catch (err) {
      console.log(err);
      requestHandler.sendError(req, res, err);
    }
  }

  static async initConditions(req, res) {
    try {
      const reqData = { ...req.query, owner: req.params.userId };
      if (reqData.tag && typeof reqData.tag == "string") {
        reqData.tag = reqData.tag.split(",");
      }
      const schema = Joi.object({
        owner: Joi.string().required(),
        page: Joi.number().integer().required(),
        rows: Joi.number().integer().required(),
        sort: Joi.string(),
        order: Joi.number(),
        name: Joi.string(),
        status: Joi.string().valid("NOT YET", "PROCESSING"),
      });

      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Request Data"
      );
      const { owner, page, rows, sort, order, name, status } = value;

      const limit = rows;
      const skip = page * rows;
      const aggregateConfig = [
        { $match: { $and: [{ owner: owner }] } },
        {
          $facet: {
            totalSize: [{ $count: "totalSize" }],
            list: [
              { $limit: skip + limit },
              { $skip: skip },
              {
                $project: {
                  _id: 0,
                  conditionId: "$_id",
                  name: 1,
                  owner: 1,
                  status: 1,
                  updatedAt: 1,
                  createdAt: 1,
                  achievement: 1,
                },
              },
            ],
          },
        },
      ];

      if (name) {
        aggregateConfig[0].$match.$and.push({
          name: { $regex: ".*" + name + ".*", $options: "i" },
        });
      }

      if (status) {
        aggregateConfig[0].$match.$and.push({
          status: status,
        });
      }

      switch (sort) {
        case "name":
          aggregateConfig[1].$facet.list.unshift({ $sort: { name: order } });
          break;
        case "update":
          aggregateConfig[1].$facet.list.unshift({
            $sort: { updatedAt: order },
          });
          break;
        case "create":
          aggregateConfig[1].$facet.list.unshift({
            $sort: { createdAt: order },
          });
          break;
        default:
          aggregateConfig[1].$facet.list.unshift({
            $sort: { updatedAt: -1 },
          });
      }

      const result = await super.aggregate("Condition", aggregateConfig);
      const retData = {};
      if (result[0].totalSize.length == 0) {
        retData.totalSize = 0;
      } else {
        retData.totalSize = result[0].totalSize[0].totalSize;
      }
      retData.list = result[0].list;

      return requestHandler.sendSuccess(
        res,
        `${value.owner}\`s Conditions Extracted`
      )(retData);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }

  static async fetchConditions(req, res) {
    try {
      const reqData = { ...req.query, owner: req.params.userId };
      if (reqData.tag && typeof reqData.tag == "string") {
        reqData.tag = reqData.tag.split(",");
      }
      const schema = Joi.object({
        owner: Joi.string().required(),
        page: Joi.number().integer().required(),
        rows: Joi.number().integer().required(),
        sort: Joi.string(),
        order: Joi.number(),
        name: Joi.string(),
        status: Joi.string().valid("NOT YET", "PROCESSING"),
      });

      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Request Data"
      );
      const { owner, page, rows, sort, order, name, status } = value;

      const limit = rows;
      const skip = page * rows;
      const aggregateConfig = [
        { $match: { $and: [{ owner: owner }] } },
        {
          $facet: {
            totalSize: [{ $count: "totalSize" }],

            list: [
              { $limit: skip + limit },
              { $skip: skip },
              {
                $project: {
                  _id: 0,
                  conditionId: "$_id",
                  name: 1,
                  owner: 1,
                  status: 1,
                  updatedAt: 1,
                  createdAt: 1,
                  achievement: 1,
                },
              },
            ],
          },
        },
      ];

      if (name) {
        aggregateConfig[0].$match.$and.push({
          name: { $regex: ".*" + name + ".*", $options: "i" },
        });
      }

      if (status) {
        aggregateConfig[0].$match.$and.push({
          status: status,
        });
      }

      if (sort && order) {
        switch (sort) {
          case "name":
            aggregateConfig[1].$facet.list.unshift({ $sort: { name: order } });
            break;
          case "update":
            aggregateConfig[1].$facet.list.unshift({
              $sort: { updatedAt: order },
            });
            break;
          case "create":
            aggregateConfig[1].$facet.list.unshift({
              $sort: { createdAt: order },
            });
            break;
          default:
            aggregateConfig[1].$facet.list.unshift({
              $sort: { createdAt: 1 },
            });
        }
      }

      const result = await super.aggregate("Condition", aggregateConfig);
      const retData = {};
      if (result[0].totalSize.length == 0) {
        retData.totalSize = 0;
      } else {
        retData.totalSize = result[0].totalSize[0].totalSize;
      }
      retData.list = result[0].list;

      return requestHandler.sendSuccess(
        res,
        `${value.owner}\`s Conditions Extracted`
      )(retData);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }

  static async updateCondition(req, res) {
    try {
      const reqData = {
        ...req.body,
        owner: req.decoded.payload.id,
        conditionId: req.params.conditionId,
      };
      const achievement = Joi.object().keys({
        name: Joi.string().required(),
        link: Joi.string().required(),
      });

      const schema = Joi.object({
        owner: Joi.string().required(),
        conditionId: Joi.string().required(),
        name: Joi.string(),
        status: Joi.string().valid("ASSIGNED", "PROCESSING", "DONE"),
        achievement: Joi.array().items(achievement),
      });

      const { value, error } = schema.validate(reqData);

      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Condition Data"
      );

      const { conditionId } = value;
      delete value.conditionId;
      delete value.owner;

      const result = await super.updateOne(
        "Condition",
        { _id: ObjectId(conditionId) },
        { $set: value }
      );
      return requestHandler.sendSuccess(res, `Update Condition`)(result);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }

  static async deleteCondition(req, res) {
    try {
      const reqData = {
        conditionId: req.params.conditionId,
        owner: req.decoded.payload.id,
      };

      const schema = Joi.object({
        conditionId: Joi.string().required(),
        owner: Joi.string().required(),
      });

      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(error, 400, "bad Request", "invalid User Id");

      const { conditionId } = value;

      const result = await super.deleteById("Condition", conditionId);
      return requestHandler.sendSuccess(res, `Delete Condition`)(result);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }
}
module.exports = ConditionController;
