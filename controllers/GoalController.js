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

class GoalController extends BaseController {
  static async createGoal(req, res) {
    try {
      const reqData = { ...req.body, owner: req.decoded.payload.id };
      const schema = Joi.object({
        owner: Joi.string().required(),
        name: Joi.string().required(),
        tag: Joi.array().items(Joi.string()),
        detail: Joi.string(),
      });

      const { value, error } = schema.validate(reqData);
      logger.log(JSON.stringify(error), "error");
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Goal Data"
      );
      const { owner, name, tag, detail } = value;

      const checkExist = await super.getByOptions("Goal", { owner, name });
      if (checkExist.length > 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid Goal name, this Goal name already existed"
        )();
      }

      const result = await super.create("Goal", value);
      const retData = { ...result.toObject() };
      retData.goalId = retData._id;
      delete retData._id;
      delete retData.__v;

      return requestHandler.sendSuccess(res, `Create Goal`)(retData);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async initGoals(req, res) {
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
        tag: Joi.array().items(Joi.string()),
        name: Joi.string(),
        status: Joi.string().valid("ASSIGNED", "PROCESSING", "DONE"),
      });

      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Request Data"
      );
      const { owner, page, rows, sort, order, name, tag, status } = value;

      const tagAggregateConfig = [
        { $match: { owner: owner } },
        { $unwind: "$tag" },
        {
          $project: {
            owner: 1,
            tag: 1,
          },
        },
        {
          $group: {
            _id: "$owner",
            tag: { $addToSet: "$tag" },
          },
        },
        {
          $project: {
            owner: "$_id",
            _id: 0,
            tag: 1,
          },
        },
      ];
      const tagSet = await super.aggregate("Goal", tagAggregateConfig);

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
                  goalId: "$_id",
                  name: 1,
                  detail: 1,
                  owner: 1,
                  status: 1,
                  updatedAt: 1,
                  createdAt: 1,
                  achievement: 1,
                  tag: 1,
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

      if (tag && tag.length > 0) {
        const or = [];
        tag.forEach((t) => {
          or.push({ $in: [t, "$tag"] });
        });
        aggregateConfig[0].$match.$and.push({
          $expr: { $or: or },
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

      const result = await super.aggregate("Goal", aggregateConfig);
      const retData = {};
      if (result[0].totalSize.length == 0) {
        retData.totalSize = 0;
      } else {
        retData.totalSize = result[0].totalSize[0].totalSize;
      }
      retData.list = result[0].list;
      retData.tag = tagSet[0];

      return requestHandler.sendSuccess(
        res,
        `${value.owner}\`s Goals Extracted`
      )(retData);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }

  static async fetchGoals(req, res) {
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
        tag: Joi.array().items(Joi.string()),
        name: Joi.string(),
        status: Joi.string().valid("ASSIGNED", "PROCESSING", "DONE"),
      });

      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Request Data"
      );
      const { owner, page, rows, sort, order, name, tag, status } = value;

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
                  goalId: "$_id",
                  name: 1,
                  detail: 1,
                  owner: 1,
                  status: 1,
                  updatedAt: 1,
                  createdAt: 1,
                  achievement: 1,
                  tag: 1,
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

      if (tag && tag.length > 0) {
        const or = [];
        tag.forEach((t) => {
          or.push({ $in: [t, "$tag"] });
        });
        aggregateConfig[0].$match.$and.push({
          $expr: { $or: or },
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

      const result = await super.aggregate("Goal", aggregateConfig);
      const retData = {};
      if (result[0].totalSize.length == 0) {
        retData.totalSize = 0;
      } else {
        retData.totalSize = result[0].totalSize[0].totalSize;
      }
      retData.list = result[0].list;
      retData.tag = result[0].tag;

      return requestHandler.sendSuccess(
        res,
        `${value.owner}\`s Goals Extracted`
      )(retData);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }

  static async updateGoal(req, res) {
    try {
      const reqData = {
        ...req.body,
        owner: req.decoded.payload.id,
        goalId: req.params.goalId,
      };
      const achievement = Joi.object().keys({
        name: Joi.string().required(),
        link: Joi.string().required(),
      });

      const schema = Joi.object({
        owner: Joi.string().required(),
        goalId: Joi.string().required(),
        name: Joi.string(),
        detail: Joi.string(),
        tag: Joi.array().items(Joi.string()),
        status: Joi.string().valid("ASSIGNED", "PROCESSING", "DONE"),
        achievement: Joi.array().items(achievement),
      });

      const { value, error } = schema.validate(reqData);

      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Goal Data"
      );

      const { owner, name, goalId, tag } = value;
      delete value.goalId;
      delete value.owner;

      const result = await super.updateOne(
        "Goal",
        { _id: ObjectId(goalId) },
        { $set: value }
      );
      return requestHandler.sendSuccess(res, `Update Goal`)(result);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }

  static async deleteGoal(req, res) {
    try {
      const reqData = {
        goalId: req.params.goalId,
        owner: req.decoded.payload.id,
      };

      const schema = Joi.object({
        goalId: Joi.string().required(),
        owner: Joi.string().required(),
      });

      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(error, 400, "bad Request", "invalid User Id");

      const { goalId } = value;

      const result = await super.deleteById("Goal", goalId);
      return requestHandler.sendSuccess(res, `Delete Goal`)(result);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }
}
module.exports = GoalController;
