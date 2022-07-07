const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const async = require("async");
const jwt = require("jsonwebtoken");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const BaseController = require("../controllers/BaseController");
const stringUtil = require("../utils/stringUtil");
// const email = require("../utils/email");
const config = require("../config");
const auth = require("../utils/auth");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class AuthController extends BaseController {
  static async login(req, res) {
    try {
      const schema = {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        fcmToken: Joi.string(),
        platform: Joi.string().valid("ios", "android", "web").required(),
      };
      const { error } = Joi.validate(
        {
          email: req.body.email,
          password: req.body.password,
          fcmToken: req.body.fcmToken,
          platform: req.headers.platform,
        },
        schema
      );
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        error ? error.details[0].message : ""
      );
    } catch (error) {
      requestHandler.sendError(req, res, error);
    }
  }

  static async signUp(req, res) {
    try {
      const data = req.body;
      const schema = {
        email: Joi.string().email().required(),
        name: Joi.string().required(),
      };
      const randomString = stringUtil.generateString();

      const { error } = Joi.validate(
        { email: data.email, name: data.name },
        schema
      );
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        error ? error.details[0].message : ""
      );
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async refreshToken(req, res) {
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

  static async logOut(req, res) {
    try {
      const schema = {
        platform: Joi.string().valid("ios", "android", "web").required(),
        fcmToken: Joi.string(),
      };
      const { error } = Joi.validate(
        {
          platform: req.headers.platform,
          fcmToken: req.body.fcmToken,
        },
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
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }
}
module.exports = AuthController;
