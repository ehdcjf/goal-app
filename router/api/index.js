const router = require("express").Router();

router.use("/user", require("./user"));

router.use("/goal", require("./goal"));

module.exports = router;
