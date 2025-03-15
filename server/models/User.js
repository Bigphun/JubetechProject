const { boolean } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    status: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true, lowercase: true, 
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Please fill a valid email address'] },
    email_verified_at: { type: Date, default: null },
    point: { type: Number, default: 0 },
    password: { type: String, required: true },
    role_ids: [{ type: mongoose.Types.ObjectId, ref: "Role" }]
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
