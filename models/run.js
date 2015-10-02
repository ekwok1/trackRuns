var mongoose = require("mongoose");

var runSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  timeMinutes: {
    type: Number,
    required: true
  },
  timeSeconds: {
    type:Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

var Run = mongoose.model("Run", runSchema);

module.exports = Run;