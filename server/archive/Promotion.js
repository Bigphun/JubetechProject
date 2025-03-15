const mongoose = require('mongoose');
const { Schema } = mongoose;

const promotionSchema = new Schema(
    {
      promotionname: { type: String, required: true },
      code: { type: String, required: true},
    }, 
    {
      timestamps: true
    }
  );

const Promotion = mongoose.model('Promotion', promotionSchema);
module.exports = Promotion;