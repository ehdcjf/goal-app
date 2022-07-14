const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const BaseController = require("./BaseController");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const config = require("../config");
const auth = require("../utils/auth");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class AuthController extends BaseController {
  static async join(req, res) {
    try {
      const reqData = req.body;
      const schema = Joi.object({
        id: Joi.string().required(),
        pw: Joi.string().required(),
        name: Joi.string().required(),
      });
      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Join Data"
      );
      const { id, name, pw } = value;

      const checkExist = await super.getByOptions("User", { id });
      if (checkExist.length > 0) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid id, this id already existed"
        )();
      }

      const salt = bcrypt.genSaltSync(Number(config.auth.saltRounds));
      const hashedPass = bcrypt.hashSync(pw, salt);

      const data = {
        ...value,
        pw: hashedPass,
      };

      await super.create("User", data);

      const payload = { id, name };

      const token = jwt.sign({ payload }, config.auth.jwt_secret, {
        expiresIn: config.auth.jwt_expiresin,
        algorithm: "HS512",
      });

      return requestHandler.sendSuccess(
        res,
        `Create User`
      )({ user: { id: id, name: name }, token });
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  static async login(req, res) {
    try {
      const reqData = req.body;
      const schema = Joi.object({
        id: Joi.string().required(),
        pw: Joi.string().required(),
      });
      const { value, error } = schema.validate(reqData);
      requestHandler.validateJoi(
        error,
        400,
        "bad Request",
        "invalid Login Data"
      );
      const { id, pw } = value;

      const user = await super.getOneByOptions("User", { id });
      if (!user) {
        requestHandler.throwError(401, "bad request", "invalid id")();
      }

      await bcrypt.compare(pw, user.pw).then(
        requestHandler.throwIf(
          (r) => !r,
          400,
          "incorrect",
          "failed to login bad credentials"
        ),
        requestHandler.throwError(500, "bcrypt error")
      );

      const payload = _.omit(user, [
        "_id",
        "pw",
        "updatedAt",
        "createdAt",
        "__v",
      ]);

      const token = jwt.sign({ payload }, config.auth.jwt_secret, {
        expiresIn: config.auth.jwt_expiresin,
        algorithm: "HS512",
      });
      // const refreshToken = jwt.sign(
      //   {
      //     payload,
      //   },
      //   config.auth.refresh_token_secret,
      //   {
      //     expiresIn: config.auth.refresh_token_expiresin,
      //   }
      // );
      // const response = {
      //   status: "Logged in",
      //   token,
      //   refreshToken,
      // };
      // tokenList[refreshToken] = response;
      requestHandler.sendSuccess(
        res,
        "User logged in Successfully"
      )({
        user: { id: user.id, name: user.name },
        token,
        // refreshToken
      });
    } catch (error) {
      requestHandler.sendError(req, res, error);
    }
  }

  // static async refreshToken(req, res) {
  //   try {
  //     const data = req.body;
  //     if (_.isNull(data)) {
  //       requestHandler.throwError(
  //         400,
  //         "bad request",
  //         "please provide the refresh token in request body"
  //       )();
  //     }
  //     const schema = {
  //       refreshToken: Joi.string().required(),
  //     };
  //     const { error } = Joi.validate(
  //       { refreshToken: req.body.refreshToken },
  //       schema
  //     );
  //     requestHandler.validateJoi(
  //       error,
  //       400,
  //       "bad Request",
  //       error ? error.details[0].message : ""
  //     );
  //     const tokenFromHeader = auth.getJwtToken(req);
  //     const user = jwt.decode(tokenFromHeader);

  //     if (data.refreshToken && data.refreshToken in tokenList) {
  //       const token = jwt.sign({ user }, config.auth.jwt_secret, {
  //         expiresIn: config.auth.jwt_expiresin,
  //         algorithm: "HS512",
  //       });
  //       const response = {
  //         token,
  //       };
  //       // update the token in the list
  //       tokenList[data.refreshToken].token = token;
  //       requestHandler.sendSuccess(
  //         res,
  //         "a new token is issued ",
  //         200
  //       )(response);
  //     } else {
  //       requestHandler.throwError(
  //         400,
  //         "bad request",
  //         "no refresh token present in refresh token list"
  //       )();
  //     }
  //   } catch (err) {
  //     requestHandler.sendError(req, res, err);
  //   }
  // }

  static async logout(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const user = jwt.decode(tokenFromHeader);
      const options = {
        where: {
          user_id: user.payload.id,
        },
      };
      const fmcToken = await super.getByCustomOptions(
        req,
        "UserTokens",
        options
      );
      req.params.id = fmcToken.dataValues.id;
      const deleteFcm = await super.deleteById(req, "UserTokens");
      if (deleteFcm === 1) {
        requestHandler.sendSuccess(res, "User Logged Out Successfully")();
      } else {
        requestHandler.throwError(
          400,
          "bad request",
          "User Already logged out Successfully"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }
}
module.exports = AuthController;
