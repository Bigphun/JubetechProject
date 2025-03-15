const mongoose = require("mongoose");
const { Schema } = mongoose;

const LessonSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["lecture", "video"], required: true },
    sub_file: [{ type: String }],
    main_content: { type: String, required: true },
    duration: { type: Number, default: 0 },
    isFreePreview: { type: Boolean, default: false },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Lessons", LessonSchema);