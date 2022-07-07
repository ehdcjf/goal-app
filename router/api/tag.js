const router = require("express").Router();
const TagController = require("../../controllers/TagController");
const auth = require("../../utils/auth");

router.get("/:id", TagController.fetchTags);

router.post("/new", TagController.createTag);

router.patch("/:id", TagController.updateTag);

router.delete("/:id", TagController.deleteTag);

module.exports = router;
