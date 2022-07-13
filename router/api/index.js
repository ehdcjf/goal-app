const router = require("express").Router();

router.use("/", require("./auth"));

router.use("/user", require("./user"));

router.use("/tag", require("./tag"));

router.use("/goal", require("./goal"));

module.exports = router;
