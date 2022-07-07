const router = require("express").Router();
const AuthController = require("../../controllers/AuthController");
const auth = require("../../utils/auth");

router.post("/join", AuthController.join);

router.post("/login", AuthController.login);

// router.post("/refreshToken", AuthController.refreshToken);

// router.post("/logout", AuthController.logout);
module.exports = router;
