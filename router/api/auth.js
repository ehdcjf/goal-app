const router = require("express").Router();
const AuthController = require("../../controllers/AuthController");
const auth = require("../../utils/auth");

/**
 * @swagger
 * /join:
 *   post:
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: sign up
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - id
 *           - name
 *           - pw
 *         properties:
 *           id:
 *             type: string
 *           name:
 *             type: string
 *           pw:
 *             type: string
 *         example:
 *           id: "kill"
 *           name: "kill"
 *           pw: "1234"
 *     responses:
 *       200:
 *         description: Create User
 */
router.post("/join", AuthController.join);

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: login
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - id
 *           - pw
 *         properties:
 *           id:
 *             type: string
 *           pw:
 *             type: string
 *         example:
 *           id: "kill"
 *           pw: "1234"
 *     responses:
 *       200:
 *         description: User logged in Successfully
 */
router.post("/login", AuthController.login);

// router.post("/refreshToken", AuthController.refreshToken);

// router.post("/logout", AuthController.logout);
module.exports = router;
