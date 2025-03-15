const mongoose = require("mongoose");
const { Schema } = mongoose;

const SectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 70 },
    lesson_ids: [{ type: mongoose.Types.ObjectId, ref: "Lessons" }],
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Sections", SectionSchema);

