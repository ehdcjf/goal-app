require("dotenv").config();

// config.js
module.exports = {
  app: {
    port: process.env.DEV_APP_PORT || 3000,
    appName: process.env.APP_NAME || "cheolog",
    env: process.env.NODE_ENV || "development",
  },
  db: {
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || "cheolog",
    password: String(process.env.DB_PASS) || "password",
    username: process.env.DB_USER || "root",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: true,
  },
  mysql: {
    host: "localhost",
    port: 3306,
    user: "root",
    password: String(process.env.DB_PASSWORD),
    database: "cheolog",
    multipleStatements: true,
    connectionLimit: 100,
  },
  winiston: {
    logpath: "/logs/",
  },
  auth: {
    jwt_secret: process.env.JWT_SECRET || "killYou",
    jwt_expiresin: process.env.JWT_EXPIRES_IN || "1d",
    saltRounds: process.env.SALT_ROUND || 10,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || "killYou",
    refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || "2d", // 2 days
  },
};
