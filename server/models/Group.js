const mongoose = require("mongoose");
const { Schema } = mongoose;

const GroupSchema = new Schema({
    name: { type: String, required: true, maxlength: 80, unique: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Groups", GroupSchema);