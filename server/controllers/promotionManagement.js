const mongoose = require("mongoose");
const Promotion = require("../models/Promotion");

// Get all Promotions
const getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find().populate('courses');
        res.status(200).json(promotions);
    } catch (err) {
        res.status(400).json({ message: "Error fetching promotions", error: err.message });
    }
};

// Get Promotion by ID
const getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id).populate('courses');
        if (!promotion) return res.status(404).json({ message: "Promotion not found" });
        res.status(200).json(promotion);
    } catch (err) {
        res.status(400).json({ message: "Error fetching promotion", error: err.message });
    }
};

// Create Promotion
const createPromotion = async (req, res) => {
    try {
        const { name, for_course, courses, code , status,  
            type, discount, min_purchase_amount, max_discount, 
            condition_type, quantity_per_day, quantity, remark,
            start_date, end_date, times } = req.body;

        if (!Array.isArray(courses)) {
            return res.status(400).json({ message: "Courses must be an array" });
        }
        if (courses.some(id => !mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Invalid ObjectId in courses array" });
        }

        if (for_course === "specific" && (!Array.isArray(courses) || courses.length === 0)) {
            return res.status(400).json({ message: "At least one course is required when 'For Course' is 'Specific'." });
        }

        const existingPromotion = await Promotion.findOne({ name });
        if (existingPromotion) {
            return res.status(400).json({ message: "Promotion name is already in use" });
        }
        
        const existingPromotionCode = await Promotion.findOne({ code });
        if (existingPromotionCode) {
            return res.status(400).json({ message: "Promotion code is already in use" });
        }

        // Format times  to `Date` objects
        const formattedTimes = Array.isArray(times) ? times.map(time => {
            const currentDate = new Date().toISOString().split("T")[0]; 
            return{
                 start_time: time.start_time ? new Date(`${currentDate}T${time.start_time}:00Z`) : '',
                 end_time: time.end_time ? new Date(`${currentDate}T${time.end_time}:00Z`) : ''
            };
        }) : [];

        const newPromotion = new Promotion({
            name,
            for_course: for_course === "specific" ? "specific" : "all",
            courses: courses.map(id => new mongoose.Types.ObjectId(id)), 
            code,
            status: typeof status === "boolean" ? status : false,
            type: ["amount", "percent"].includes(type) ? type : "amount", 
            discount,
            min_purchase_amount,
            max_discount,
            condition_type: ["Once", "Unlimited", "LimitPerDay"].includes(condition_type) ? condition_type : "Once",
            quantity_per_day,
            quantity,
            remark,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            times: formattedTimes,
        });

        await newPromotion.save();
        res.status(201).json({ message: "Promotion created successfully", promotion: newPromotion });
    } catch (err) {
        res.status(500).json({ message: "Error creating promotion", error: err.message });
    }
};

// Update Promotion
const updatePromotion = async (req, res) => {
    try {
        const { name, for_course, courses, code, status,  
            type, discount, min_purchase_amount, max_discount, 
            condition_type, quantity_per_day, quantity, remark,
            start_date, end_date, times } = req.body;

        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        if (!Array.isArray(courses) || courses.some(id => !mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Courses must be an array of valid ObjectIds" });
        }

        if (for_course === "specific" && (!Array.isArray(courses) || courses.length === 0)) {
                return res.status(400).json({ message: "At least one course is required when 'For Course' is 'Specific'." });
            }
        
        if (name && name !== promotion.name) {
            const existingPromotion = await Promotion.findOne({ name });
            if (existingPromotion) {
                return res.status(400).json({ message: "Promotion name is already in use" });
            }
        }

        // Format times  to `Date` objects
        const formattedTimes = Array.isArray(times) ? times.map(time => {
            const currentDate = new Date().toISOString().split("T")[0]; 
            return{
                 start_time: time.start_time ? new Date(`${currentDate}T${time.start_time}:00Z`) : '',
                 end_time: time.end_time ? new Date(`${currentDate}T${time.end_time}:00Z`) : ''
            };
        }) : [];

        // Transform times to response format
        const responseTimes = Array.isArray(promotion.times) ? promotion.times.map(time => {
            return {
                start_time: time.start_time ? time.start_time.toISOString().split("T")[1].substring(0, 5) : '',
                end_time: time.end_time ? time.end_time.toISOString().split("T")[1].substring(0, 5) : ''
            };
        }) : [];

        // Update other fields
        promotion.name = name || promotion.name;
        promotion.for_course = for_course || promotion.for_course;
        promotion.courses = courses.map(id => new mongoose.Types.ObjectId(id)) || promotion.courses;
        promotion.code = code || promotion.code;
        promotion.status = (status || status == false) ? status : promotion.status;
        promotion.type = type || promotion.type;
        promotion.discount = discount || promotion.discount;
        promotion.min_purchase_amount = min_purchase_amount || promotion.min_purchase_amount;
        promotion.max_discount = max_discount || promotion.max_discount;
        promotion.condition_type = condition_type || promotion.condition_type;
        promotion.quantity_per_day = quantity_per_day || promotion.quantity_per_day;
        promotion.quantity = quantity || promotion.quantity;
        promotion.remark = remark || promotion.remark;
        promotion.start_date = start_date || promotion.start_date;
        promotion.end_date = end_date || promotion.end_date;
        promotion.times = formattedTimes.length > 0 ? formattedTimes : promotion.times;

        await promotion.save();        
        res.status(200).json({ 
            message: "Promotion updated successfully", 
            promotion: { ...promotion.toObject(), times: responseTimes } 
        });

    } catch (err) {
        res.status(500).json({ message: "Error updating promotion", error: err.message });
    }
};

// Delete Promotion
const deletePromotion = async (req, res) => {
    try {
        const deletedPromotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!deletedPromotion) return res.status(404).json({ message: "Promotion not found" });
        res.status(200).json({ message: "Promotion deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting promotion", error: err.message });
    }
};

module.exports = { 
    getAllPromotions, 
    getPromotionById, 
    createPromotion, 
    updatePromotion, 
    deletePromotion 
};