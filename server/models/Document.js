const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  _id: { type: String },
  data: { type: String },
});

const DocumentModel = mongoose.model("documents", DocumentSchema);
module.exports = DocumentModel;
