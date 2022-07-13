const mongoose = require("mongoose");

const TagSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.String,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const TagModel = mongoose.model("Tag", TagSchema);
module.exports = TagModel;
