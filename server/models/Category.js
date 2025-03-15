const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true, maxlength: 80 },
    group_ids: [{ type: mongoose.Types.ObjectId, ref: "Groups" }],
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Categories", CategorySchema);