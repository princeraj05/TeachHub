const mongoose = require("mongoose");

const EventVideoInteractionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    videoUrl: {
      type: String,
      required: true,
      index: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// Compound index for fast lookup of a specific video interaction
EventVideoInteractionSchema.index({ eventId: 1, videoUrl: 1 }, { unique: true });

module.exports = mongoose.model("EventVideoInteraction", EventVideoInteractionSchema);
