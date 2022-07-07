const router = require("express").Router();
const UserController = require("../../controllers/UserController");
const auth = require("../../utils/auth");

router.get("/:id", UserController.fetchUserById);

router.put("/:id", UserController.updateUser);

router.delete("/:id", UserController.removeUser);

module.exports = router;
