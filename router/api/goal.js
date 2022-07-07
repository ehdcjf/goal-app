const router = require("express").Router();
const GoalController = require("../../controllers/GoalController");
const auth = require("../../utils/auth");

router.post("/new", GoalController.createNewGoal);

router.get("/:id", GoalController.fetchAllGoalsById);

module.exports = router;
