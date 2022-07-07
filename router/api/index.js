const router = require("express").Router();

router.use("/user", require("./user"));

router.use("/auth", require("./auth"));

router.use("/tag", require("./tag"));

// router.use("/goal", require("./goal"));

module.exports = router;
