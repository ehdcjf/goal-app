const router = require("express").Router();
const TagController = require("../../controllers/TagController");
const auth = require("../../utils/auth");

router.get("/", TagController.fetchTags);

router.post("/new", auth.isAuthunticated, TagController.createTag);

router.patch("/:tagId", auth.isAuthunticated, TagController.updateTag);

router.delete("/:tagId", TagController.deleteTag);

module.exports = router;
