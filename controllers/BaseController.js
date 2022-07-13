const { result } = require("lodash");
const { ObjectId } = require("mongodb");
const MongoDB = require("../models/index");
const Logger = require("../utils/logger");
const logger = new Logger();
const RequestHandler = require("../utils/RequestHandler");
const requestHandler = new RequestHandler(logger);
class BaseController {
  static async create(model, data) {
    try {
      const newDoc = new MongoDB[model](data);
      await newDoc.save();
      return newDoc;
    } catch (err) {
      throw err;
    }
  }

  static async createMany(model, data) {
    try {
      const result = await MongoDB[model].insertMany(data);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getById(model, id) {
    try {
      const result = await MongoDB[model].findById(ObjectId(id)).lean();
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getByOptions(model, options) {
    try {
      const result = await MongoDB[model].find(options).lean();
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async getCount(model, options) {
    try {
      const result = await MongoDB[model].find(options).count();
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async getOneByOptions(model, options) {
    try {
      const result = await MongoDB[model].findOne(options).lean();
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async getList(model, options) {
    let result;
    try {
    } catch (err) {
      return Promise.reject(err);
    }
    return result;
  }

  static async updateOne(model, filter, options) {
    try {
      const result = await MongoDB[model].updateOne(filter, options);
      if (result.modifiedCount == 0) {
        requestHandler.throwError(400, "bad request", "Failed to update.")();
      }
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async updateMany(model, filter, options) {
    try {
      const result = await MongoDB[model].updateMany(filter, options);
      if (result.modifiedCount == 0) {
        requestHandler.throwError(400, "bad request", "Failed to update.")();
      }
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async deleteById(model, id) {
    try {
      const result = await MongoDB[model].deleteOne({ _id: ObjectId(id) });
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async deleteByOptions(model, options) {
    let result;
    try {
    } catch (err) {
      return Promise.reject(err);
    }
    return result;
  }

  static async aggregate(model, config) {
    try {
      const result = await MongoDB[model].aggregate(config);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = BaseController;
