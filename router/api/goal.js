const router = require("express").Router();
const GoalController = require("../../controllers/GoalController");
const auth = require("../../utils/auth");

/**
 * @swagger
 * /goal/new:
 *   post:
 *     summary: Create New Goal
 *     tags:
 *       - Goal
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description:
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - name
 *         properties:
 *           name:
 *             type: string
 *           tag:
 *             type: array
 *             items:
 *               type: string
 *           detail:
 *             type: string
 *         example:
 *           name: "ECS 배포"
 *           tag: ["cheolog","Docker","AWS","ECS"]
 *           detail: "개인 프로젝트를 ECS로 배포"
 *     responses:
 *       200:
 *         description: Create Goal
 */
router.post("/new", auth.isAuthunticated, GoalController.createGoal);

/**
 * @swagger
 * /goal/{userId}:
 *   get:
 *     summary: Fetch Goal List
 *     tags:
 *       - Goal
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: userId
 *        description: userid
 *        in: path
 *        required: true
 *        type: string
 *
 *      - name: page
 *        description: Page Number
 *        in: query
 *        required: true
 *        type: integer
 *
 *      - name: rows
 *        description: Number of rows
 *        in: query
 *        required: true
 *        type: integer
 *
 *      - name: sortby
 *        description: Indicates which record column to sort by.
 *        in: query
 *        required: false
 *        type: string
 *        enum:
 *          - name
 *          - create
 *          - update
 *
 *      - name: order
 *        description: "new:1, old:-1"
 *        in: query
 *        required: false
 *        type: integer
 *        enum:
 *          - 1
 *          - -1
 *
 *      - name: status
 *        description: goal`s status
 *        in: query
 *        required: false
 *        type: string
 *        enum:
 *          - ASSIGNED
 *          - PROCESSING
 *          - DONE
 *
 *      - name: tag
 *        description: goal`s tag.
 *        in: query
 *        required: false
 *        type: array
 *        items:
 *          type: string
 *     responses:
 *       200:
 *         description: Create Goal
 */
router.get("/:userId", GoalController.fetchGoals);
router.get("/:userId/init", GoalController.initGoals);

/**
 * @swagger
 * /goal/{goalId}:
 *   patch:
 *     summary: Update Goal
 *     tags:
 *       - Goal
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: goalId
 *       description: goal Id
 *       in : path
 *       type: string
 *     - name: body
 *       in: body
 *       description:
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           tag:
 *             type: array
 *             items:
 *               type: string
 *           detail:
 *             type: string
 *           status:
 *             type: string
 *             example: "ASSIGNED or PROCESSING or DONE"
 *           achievement:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   required: true
 *                 link:
 *                   type: string
 *                   required: true
 *
 *     responses:
 *       200:
 *         description: Update Goal
 */
router.patch("/:goalId", auth.isAuthunticated, GoalController.updateGoal);

/**
 * @swagger
 * /goal/{goalId}:
 *   delete:
 *     summary: Delete Goal
 *     tags:
 *       - Goal
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: goalId
 *       description: goal Id
 *       in : path
 *       type: string
 *     responses:
 *       200:
 *         description: Delete Goal
 */
router.delete("/:goalId", auth.isAuthunticated, GoalController.deleteGoal);

module.exports = router;

/**


 *         style: form
 *         explode: false
 *
 */
