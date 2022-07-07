const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const MySql = require("../server/database");
const GoalSQL = require("../sql/GoalSQL");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const config = require("../config");
const auth = require("../utils/auth");
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class GoalController {
  static async fetchAllGoalsById(req, res) {
    try {
      const reqData = { id: req.params.id };
      const schema = Joi.object({
        id: Joi.string().required(),
      });

      const { value } = schema.validate(reqData);
      requestHandler.validateJoi(value, 400, "bad Request", "invalid User Id");

      const sql = GoalSQL.fetchAllGoalsById(value);
      const result = await MySql.query(sql);
      return requestHandler.sendSuccess(
        res,
        `${value}s Goals Extracted`
      )(result.data);
    } catch (error) {
      return requestHandler.sendError(req, res, error);
    }
  }

  static async createNewGoal(req, res) {
    try {
      const data = req.body;
      if (_.isNull(data)) {
        requestHandler.throwError(
          400,
          "bad request",
          "please provide the refresh token in request body"
        )();
      }
      const schema = {
        refreshToken: Joi.string().required(),
      };
      const { error } = Joi.validate(
        { refreshToken: req.body.refreshToken },
        schema
      );
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        error ? error.details[0].message : ""
      );
      const tokenFromHeader = auth.getJwtToken(req);
      const user = jwt.decode(tokenFromHeader);

      if (data.refreshToken && data.refreshToken in tokenList) {
        const token = jwt.sign({ user }, config.auth.jwt_secret, {
          expiresIn: config.auth.jwt_expiresin,
          algorithm: "HS512",
        });
        const response = {
          token,
        };
        // update the token in the list
        tokenList[data.refreshToken].token = token;
        requestHandler.sendSuccess(
          res,
          "a new token is issued ",
          200
        )(response);
      } else {
        requestHandler.throwError(
          400,
          "bad request",
          "no refresh token present in refresh token list"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }
}
module.exports = GoalController;
