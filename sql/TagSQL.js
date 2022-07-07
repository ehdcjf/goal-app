const Logger = require("../utils/logger");
// const email = require("../utils/email");
const config = require("../config");
const logger = new Logger();

class GoalSQL {
  static async fetchAllGoalsById(data) {
    return `
      SELECT * 
      FROM pgoal;
    `;
  }
}
module.exports = GoalSQL;
