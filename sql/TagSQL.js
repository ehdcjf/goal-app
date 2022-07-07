const Logger = require("../utils/logger");
// const email = require("../utils/email");
const config = require("../config");
const logger = new Logger();

class TagSQL {
  static checkExistByName(owner, name) {
    return `
      SELECT *
      FROM tag
      WHERE owner='${owner}' AND name='${name}'
      ;
    `;
  }

  static checkExistById(owner, tagId) {
    return `
      SELECT *
      FROM tag
      WHERE owner='${owner}' AND uuid='${tagId}'
      ;
    `;
  }

  static createNewTag() {
    return `
      INSERT INTO tag(owner,name)
      VALUES(?,?);
      ;
    `;
  }

  static updateTag() {
    return `
      UPDATE tag
      set name=?
      where uuid=?
    `;
  }
}
module.exports = TagSQL;
