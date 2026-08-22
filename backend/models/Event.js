const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    eventDate: {
      type: Date,
      required: true,
      index: true
    },
    eventTime: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["upcoming", "completed"],
      default: "upcoming",
      index: true
    },
    photos: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true }
      }
    ],
    videos: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
