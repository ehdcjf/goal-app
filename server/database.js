const mysql = require("mysql2/promise");
const config = require("../config/index");
const pool = mysql.createPool(config.mysql);
const Logger = require("../utils/logger");
const logger = new Logger();

class MariaDB {
  static async dbConnect() {
    const mysql = require("mysql2");
    const connection = mysql.createConnection(config.mysql);
    connection.connect(function (err) {
      if (err) {
        logger.log(err, "error");
        throw err;
      }
      logger.log("Database Connected!", "info");
    });
  }

  static async query(sql) {
    let connection;
    try {
      connection = await pool.getConnection(async (conn) => conn);
      try {
        const [result] = await connection.query(sql);
        return result;
      } catch (error) {
        const e = new Error(error);
        e.name = "Query Error";
        throw e;
      }
    } catch (error) {
      const e = new Error(error);
      e.name = "DB Error";
      throw e;
    } finally {
      connection.release();
    }
  }

  static async execute(sql, params) {
    let connection;
    try {
      connection = await pool.getConnection(async (conn) => conn);
      try {
        const [result] = await connection.execute(sql, params);
        return result;
      } catch (error) {
        const e = new Error(error);
        e.name = "Query Error";
        throw e;
      }
    } catch (error) {
      const e = new Error(error);
      e.name = "DB Error";
      throw e;
    } finally {
      connection.release();
    }
  }
}

module.exports = MariaDB;
