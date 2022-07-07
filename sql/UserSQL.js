const Logger = require("../utils/logger");
// const email = require("../utils/email");
const config = require("../config");
const logger = new Logger();

class UserSQL {
  static createNewUser() {
    return `INSERT INTO user (id,pw,name)
            VALUES (?,?,?);
    `;
  }

  static checkUserExist(id) {
    return `SELECT *
            FROM user
            WHERE id='${id}';`;
  }
}
module.exports = UserSQL;
