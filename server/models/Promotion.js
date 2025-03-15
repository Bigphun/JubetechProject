const mongoose = require("mongoose");
const { Schema } = mongoose;

const PromotionSchema = new Schema ({
    name: { type: String, required: true, unique: true, maxlength: 100 }, // ชื่อ Promotion
    for_course: { type: String, enum: ["all", "specific"], required: true }, // promotion ทุกคอร์สหรือระบุ
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref:"Course" }], // คอร์สที่ระบุถ้าเป็น all ซ่อน input ไว้ result : []
    code: { type: String, required: true, unique: true, maxlength: 15 }, // ไม่เกิน 15 ตัวอักษรให้ admin เขียนเองหรือ auto generate
    status: { type: Boolean, required: true }, // ใช้งาน promotion ได้ไหม
    type: { type: String, enum: ["amount", "percent"], required: true }, // ส่วนลดเป็นจำนวนหรือ percent
    discount: { type: Number, required: true, max: 2000 }, // ส่วนลด
    min_purchase_amount: { type: Number, required: true }, // ต้องสั่งซื้อขั้นต่ำเท่าไหร่ถึงใช้ code ได้
    max_discount: { type: Number, required: true }, // ลดได้สูงสุดเท่าไหร่
    condition_type: { type: String, enum: ["Once", "Unlimited", "LimitPerDay"], required: true }, // เงื่อนไข [ใช้ได้ 1 ครั้ง, ไม่จำกัด, ใช้ได้ต่อวัน]
    quantity_per_day: { type: Number }, // กรณีใช้ได้ต่อวันคือใช้ได้วันละกี่ครั้งสำหรับ code
    quantity: { type: Number, required: true }, // จำนวน promotion นี้สุทธิ
    remark: { type: String }, // อธิบาย
    start_date: { type: Date, required: true }, // วันเริ่มใช้ promotion
    end_date: { type: Date, required: true }, // วันสิ้นสุด promotion (ใช้ input date)
    times: [{
        start_time: { type: Date }, // เวลาใช้ promotion ได้
        end_time: { type: Date } // เวลาที่สิ้นสุด promotion  (ใช้ input time)
    }] // สร้างเป็น Array เพราะจะเก็บเป็นช่วงเวลาที่ใช้ promotion ได้
    }, { 
        timestamps: true 
    }
);

const Promotion = mongoose.model('Promotions', PromotionSchema);
module.exports = Promotion;
