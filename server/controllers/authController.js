// Joi validate
const Joi = require("joi");
// encrypt & decrypt
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// unique
const { v4: uuidv4 } = require("uuid");
// schema
const mongoose = require("mongoose");
const Role = require("../models/Role");
const User = require("../models/User");
const Tokens = require("../models/Token");
const Transporter = require("../emails/transporter");
require("dotenv").config();

const signupValidate = Joi.object({
    firstname: Joi.string().trim().max(150).required(),
    lastname: Joi.string().trim().max(150).required(),
    email: Joi.string().trim().max(250).required().email({ tlds: { allow: ["com", "net", "org", "edu"] } }),
    password: Joi.string().trim().min(6).max(150).required(),
    confirm_password: Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only": "รหัสผ่านไม่ตรงกัน"
    }),
    otp: Joi.number().integer().min(100000).max(999999).required(),
    ref_code: Joi.string().length(36).required(),
});

const signinValidate = Joi.object({
    email: Joi.string().trim().max(250).required().email({ tlds: { allow: ["com", "net", "org", "edu"] } }),
    password: Joi.string().trim().min(6).max(150).required(),
});

async function signin(req, res) {
    try {
        const { error } = signinValidate.validate(req.body, { abortEarly: false });
        if (error && error.details) return res.status(400).json({ message: error.details });

        // 1.check email
        const { email, password } = req.body;
        const user = await User.findOne({ email, status: true });
        if (!user) return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

        // 2.check password
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

        // 3.check activated
        // const activated = Tokens.find({ for_email: email, isActive: true });
        // if (!activated) return res.status(401).json({ message: "กรุณาทำการยืนยันอีเมล" });

        // 4.create jwt
        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: "14d" });
        return res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", token });
    } catch (err) {
        console.log({ position: "Sigin", error: err });
        return res.status(500).json({ message: "มีข้อผิดพลาดบางอย่างเกิดขึ้น" });
    }
}

async function signup(req, res) {
    try {
        const { firstname, lastname, email, password, otp, ref_code } = req.body;
        // 1.check request
        const { error } = signupValidate.validate(req.body, { abortEarly: false });
        if (error && error.details) return res.status(400).json({ message: error.details });

        // 2.check otp
        const token = await Tokens.findOne({ for_email: email, token: parseInt(otp), reference_no: ref_code });
        if (!token) return res.status(400).json({ message: "ยืนยัน OTP ไม่สำเร็จกรุณาทำการเช็คอีกครั้ง" });

        // 3.check expired
        const diffTime = new Date() - new Date(token.expiredAt);
        if (diffTime > (15*60*1000)) return res.status(401).json({ message: "รหัส OTP หมดอายุกรุณาร้องขออีกครั้ง" });

        // 4.prepare data
        const student_role = await Role.findOne({ role_name: "Student" }).select("_id");
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5.check exist user
        let token_jwt
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            if (existedUser.email_verified_at) return res.status(409).json({ message: "มีผู้ใช้งานนี้ในระบบแล้ว" });
            // update verify
            existedUser.status = true;
            existedUser.firstname = firstname;
            existedUser.lastname = lastname;
            existedUser.password = hashedPassword;
            existedUser.email_verified_at = new Date();
            await existedUser.save();

            // create jwt
            token_jwt = jwt.sign({ _id: existedUser._id }, process.env.TOKEN_SECRET, { expiresIn: "14d" });
            return res.status(200).json({ message: "อัพเดตข้อมูลสมาชิกสำเร็จ", token: token_jwt });
        }
        // create user
        const newUser = await User.create({ 
            firstname, lastname, email,
            status: true,
            password: hashedPassword,
            email_verified_at: new Date(),
            role_ids: [new mongoose.Types.ObjectId(student_role._id)]
        });
        // create jwt
        token_jwt = jwt.sign({ _id: newUser._id }, process.env.TOKEN_SECRET, { expiresIn: "14d" });
        return res.status(200).json({ message: "อัพเดตข้อมูลสมาชิกสำเร็จ", token: token_jwt });
    } catch (err) {
        console.log({ position: "Signup", error: err });
        return res.status(500).json({ message: "มีข้อผิดพลาดบางอย่างเกิดขึ้น" });
    }
}

async function requestOTP(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "กรุณทำการป้อนอีเมล" });
        const token = await Tokens.create({
            for_email: email,
            token: crypto.randomInt(100000, 1000000),
            reference_no: uuidv4(),
            expiredAt: getFutureTime(),
        });
        if (sendOTP(email, token.token)) {
            return res.status(200).json({ message: "ส่งรหัส OTP สำเร็จ", ref_no: token.reference_no });
        } else {
            return res.status(500).json({ message: "ส่งรหัส OTP ไม่สำเร็จ" });
        }
    } catch (err) {
        console.log({ position: "Request OTP", error: err });
        return res.status(500).json({ message: "ส่งรหัส OTP ไม่สำเร็จ" });
    }
}

function getFutureTime(minutes = 15) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
}

async function sendOTP(destination, token) {
    try {
        const mailOptions = {
            from: "JubeTech Platform",
            to: destination,
            subject: "ยืนยันตัวตนผ่านอีเมลด้วย OTP",
            text: `รหัสในการยืนยันตัวตน ${token}`
        }
        await Transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.log({ position: "Send OTP", error: err });
        return false;
    }
}

module.exports = {
    signin,
    signup,
    requestOTP
}