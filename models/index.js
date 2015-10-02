var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/track_runs");

module.exports.User = require("./user");
module.exports.Run = require("./run");