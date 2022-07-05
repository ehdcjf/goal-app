const router = require("express").Router();
const UserController = require("../../controllers/UserController");
const auth = require("../../utils/auth");
/**
 * @swagger
 * definitions:
 *   user:
 *     required:
 *       - id
 *       - username
 *       - email
 *     properties:
 *       id:
 *         type: integer
 *       username:
 *         type: string
 *       email:
 *         type: string
 */

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     tags:
 *       - user
 *     description: Return a specific user
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: userId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: a single user object
 *         schema:
 *           $ref: '#/definitions/user'
 */
router.get("/:id([0-9])", auth.isAuthunticated, UserController.getUserById);

/**
 * @swagger
 * /user/{userId}:
 *   delete:
 *     tags:
 *       - user
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: userId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: delete user with id
 *         schema:
 *           $ref: '#/definitions/user'
 */
router.delete("/:id([0-9])", UserController.deleteById);

/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags:
 *       - user
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/user'
 */
router.get("/profile", auth.isAuthunticated, UserController.getProfile);

module.exports = router;
