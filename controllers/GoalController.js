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

      const originTags = await super.getByOptions("Tag", { owner });
      const Tags = [];

      if (tag) {
        const tags = [...new Set(tag)];
        const updateData = [];
        const createData = [];
        for (let i = 0; i < tags.length; i++) {
          const tname = tags[i];
          const index = originTags.map((v) => v.name).indexOf(tname);
          if (index > -1) {
            updateData.push({ _id: ObjectId(originTags[index]._id) });
            Tags.push(originTags[index]._id);
          } else {
            createData.push({ owner, name: tname });
          }
        }

        if (updateData.length > 0) {
          await super.updateMany(
            "Tag",
            { $or: [...updateData] },
            { $inc: { count: +1 } }
          );
        }
        if (createData.length > 0) {
          const newTags = await super.createMany("Tag", createData);
          newTags.forEach((t) => {
            Tags.push(t._id);
          });
        }
      }
      value.tag = Tags;
      const result = await super.create("Goal", value);
      const retData = { ...result.toObject() };
      retData.goalId = retData._id;
      delete retData._id;
      delete retData.__v;
      delete retData.updatedAt;
      retData.tag = [...new Set(tag)];

      return requestHandler.sendSuccess(res, `Create Goal`)(retData);
    } catch (err) {
      requestHandler.sendError(req, res, err);
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
        sortby: Joi.string(),
        order: Joi.number(),
        tag: Joi.array().items(Joi.string()),
        searchWord: Joi.string(),
        status: Joi.string().valid("ASSIGNED", "PROCESSING", "DONE"),
      });

      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Request Data"
      );
      const { owner, page, rows, sortby, order, searchWord, tag, status } =
        value;

      const limit = rows;
      const skip = (page - 1) * rows;
      const aggregateConfig = [
        {
          $lookup: {
            from: "tags",
            let: { tagId: "$tag" },
            pipeline: [{ $match: { $expr: { $in: ["$_id", "$$tagId"] } } }],
            as: "tagObjects",
          },
        },
        { $unwind: "$tagObjects" },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            detail: { $first: "$detail" },
            owner: { $first: "$owner" },
            status: { $first: "$status" },
            startedAt: { $first: "$startedAt" },
            endedAt: { $first: "$endedAt" },
            createdAt: { $first: "$createdAt" },
            achievement: { $first: "$achievement" },
            tags: { $push: "$tagObjects.name" },
          },
        },
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
                  startedAt: 1,
                  endedAt: 1,
                  createdAt: 1,
                  achievement: 1,
                  tags: 1,
                },
              },
            ],
          },
        },
      ];

      if (searchWord) {
        aggregateConfig[3].$match.$and.push({
          name: { $regex: ".*" + searchWord + ".*", $options: "i" },
        });
      }

      if (status) {
        aggregateConfig[3].$match.$and.push({
          status: status,
        });
      }

      if (tag && tag.length > 0) {
        const or = [];
        tag.forEach((t) => {
          or.push({ $in: [t, "$tags"] });
        });
        aggregateConfig[3].$match.$and.push({
          $expr: { $or: or },
        });
      }

      if (sortby && order) {
        switch (sortby) {
          case "name":
            aggregateConfig[4].$facet.list.unshift({ $sort: { name: order } });
            break;

          case "start":
            aggregateConfig[4].$facet.list.unshift({
              $sort: { startedAt: order, _id: 1 },
            });
            break;
          case "end":
            aggregateConfig[4].$facet.list.unshift({
              $sort: { endedAt: order, _id: 1 },
            });
            break;
          case "create":
            aggregateConfig[4].$facet.list.unshift({
              $sort: { createdAt: order },
            });
            break;
          default:
            aggregateConfig[4].$facet.list.unshift({
              $sort: { createdAt: 1 },
            });
        }
      }

      const result = await super.aggregate("Goal", aggregateConfig);
      const retData = {};
      if (result[0].totalSize.length == 0) {
        retData.totalSize = 0;
        retData.totalPage = 1;
      } else {
        retData.totalSize = result[0].totalSize[0].totalSize;
        retData.totalPage = Math.ceil(retData.totalSize / rows);
      }
      retData.list = result[0].list;

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
        _id: Joi.string(),
      });

      const schema = Joi.object({
        owner: Joi.string().required(),
        goalId: Joi.string().required(),
        name: Joi.string(),
        detail: Joi.string(),
        tag: Joi.array().items(Joi.string()),
        status: Joi.string().valid("ASSIGNEluD", "PROCESSING", "DONE"),
        achievement: Joi.array().items(achievement),
      });

      const { value, error } = schema.validate(reqData);
      console.log(reqData);
      console.log(value);
      console.log(error);

      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Goal Data"
      );

      const { owner, name, goalId, tag } = value;
      delete value.goalId;

      const originGoal = await super.getById("Goal", goalId);
      if (!originGoal) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid , this goal doesn't exist."
        )();
      }

      if (originGoal.owner != owner) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid , You are not the owner of this goal."
        )();
      }
      const tempDeleteTags = originGoal.tag.map((v) => {
        return { _id: ObjectId(v) };
      });

      await super.updateMany(
        "Tag",
        { $or: [...tempDeleteTags] },
        { $inc: { count: -1 } }
      );

      const originTags = await super.getByOptions("Tag", { owner });
      const Tags = [];

      if (tag) {
        const tags = [...new Set(tag)];
        const updateData = [];
        const createData = [];
        for (let i = 0; i < tags.length; i++) {
          const tname = tags[i];
          const index = originTags.map((v) => v.name).indexOf(tname);
          if (index > -1) {
            updateData.push({ _id: ObjectId(originTags[index]._id) });
            Tags.push(originTags[index]._id);
          } else {
            createData.push({ owner, name: tname });
          }
        }

        await super.updateMany(
          "Tag",
          { $or: [...updateData] },
          { $inc: { count: +1 } }
        );
        const newTags = await super.createMany("Tag", createData);
        newTags.forEach((t) => {
          Tags.push(t._id);
        });
      }

      value.tag = Tags;

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

      const { goalId, owner } = value;

      const originGoal = await super.getById("Goal", goalId);
      if (!originGoal) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid , this goal doesn't exist."
        )();
      }

      if (originGoal.owner != owner) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid , You are not the owner of this goal."
        )();
      }

      const deleteTags = originGoal.tag.map((v) => {
        return { _id: ObjectId(v) };
      });

      await super.updateMany(
        "Tag",
        { $or: [...deleteTags] },
        { $inc: { count: -1 } }
      );

      const result = await super.deleteById("Goal", goalId);
      return requestHandler.sendSuccess(res, `Delete Goal`)(result);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }
}
module.exports = GoalController;
