const router = require("express").Router();
const ConditionController = require("../../controllers/ConditionController");
const auth = require("../../utils/auth");

/**
 * @swagger
 * /condition/new:
 *   post:
 *     summary: Create New Condition
 *     tags:
 *       - Condition
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
 *         example:
 *           name: "ECS 배포"
 *     responses:
 *       200:
 *         description: Create Condition
 */
router.post("/new", auth.isAuthunticated, ConditionController.createCondition);

/**
 * @swagger
 * /condition/{userId}:
 *   get:
 *     summary: Fetch Condition List
 *     tags:
 *       - Condition
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
 *      - name: sort
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
 *        description: "new:-1, old:1"
 *        in: query
 *        required: false
 *        type: integer
 *        enum:
 *          - -1
 *          - 1
 *
 *      - name: status
 *        description: condition`s status
 *        in: query
 *        required: false
 *        type: string
 *        enum:
 *          - "NOT YET"
 *          - PROCESSING
 *
 *     responses:
 *       200:
 *         description: Fetch Condition
 */
router.get("/:userId", ConditionController.fetchConditions);

/**
 * @swagger
 * /condition/{conditionId}:
 *   patch:
 *     summary: Update Condition
 *     tags:
 *       - Condition
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: conditionId
 *       description: condition Id
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
 *           status:
 *             type: string
 *             example: "'NOT YET' or PROCESSING "
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
 *         description: Update Condition
 */
router.patch(
  "/:conditionId",
  auth.isAuthunticated,
  ConditionController.updateCondition
);

/**
 * @swagger
 * /condition/{conditionId}:
 *   delete:
 *     summary: Delete Condition
 *     tags:
 *       - Condition
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: conditionId
 *       description: condition Id
 *       in : path
 *       type: string
 *     responses:
 *       200:
 *         description: Delete Condition
 */
router.delete(
  "/:conditionId",
  auth.isAuthunticated,
  ConditionController.deleteCondition
);

module.exports = router;
