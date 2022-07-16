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

const GoalSchema = mongoose.Schema(
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
    detail: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ASSIGNED", "PROCESSING", "DONE"],
      default: "ASSIGNED",
    },
    tag: [String],
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    achievement: [achievementSchema],
  },
  { timestamps: true }
);

const GoalModel = mongoose.model("Goal", GoalSchema);
module.exports = GoalModel;
