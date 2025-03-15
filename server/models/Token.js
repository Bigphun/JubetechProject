const mongoose = require("mongoose");
const { Schema } = mongoose;

const tokenSchema = new Schema ({
    for_email: { type: String, required: true },
    token: { type: Number, required: true },
    reference_no: { type: String, required: true },
    expiredAt: { type: Date, required: true },
    isActive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Tokens", tokenSchema);