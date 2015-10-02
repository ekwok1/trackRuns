var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/track_runs");

module.exports.User = require("./user");
module.exports.Run = require("./run");