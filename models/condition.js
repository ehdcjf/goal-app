const mongoose = require("mongoose");

const achievementSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});

const ConditionSchema = mongoose.Schema(
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

    status: {
      type: String,
      enum: ["NOT YET", "PROCESSING"],
      default: "NOT YET",
    },

    achievement: [achievementSchema],
  },
  { timestamps: true }
);

const ConditionModel = mongoose.model("Condition", ConditionSchema);
module.exports = ConditionModel;
