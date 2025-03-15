// Joi Validate
const Joi = require("joi");
// HTML Sanitization
const jsdom = require("jsdom");
const DOMPurify = require("dompurify");
// Schema
const mongoose = require("mongoose");
const Lessons = require("../models/Lesson");

const { JSDOM } = jsdom;
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const LessonBlueprint = Joi.object({
    name: Joi.string().trim().max(45).required(),
    type: Joi.string().valid("lecture", "video").required(),
    sub_file: Joi.array().items(Joi.string()),
    main_content: Joi.string().required(),
    duration: Joi.number().integer(),
    isFreePreview: Joi.boolean().required()
});

const createLesson = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // check request
        const { error } = LessonBlueprint.validate(req.body, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        // create lesson
        console.log(req.body);
        await Lessons.create({
            ...req.body,
            main_content: HTMLsanitization(req.body.main_content),
            createdBy: new mongoose.Types.ObjectId(_id),
            updatedBy: new mongoose.Types.ObjectId(_id)
        });
        return res.status(201).json({ message: "The lesson was created successfully." });
    } catch (err) {
        console.error({ position: "Create Lesson", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getLessonByTutor = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // prepare query
        let filter = {};
        filter.createdBy = new mongoose.Types.ObjectId(_id);
        const { name, type, isFreePreview, startDate, endDate, page = 1, pageSize = 20 } = req.query;
        const parsePage = parseInt(page || 1);
        const parsePageSize = parseInt(pageSize || 20);
        const skip = (parsePage - 1) * parsePageSize;
        if (isNaN(parsePage) || isNaN(parsePageSize)) return res.status(400).json({ message: "The page or pageSize has an invalid format." });
        if (name) filter.name = { $regex: name, $options: "i" };
        if (type) filter.type = type;
        if (isFreePreview) filter.isFreePreview = isFreePreview;
        if (startDate || endDate) {
            filter.updatedAt = {};
            if (startDate && !isNaN(new Date(startDate))) filter.updatedAt.$gte = new Date(startDate);
            if (endDate && !isNaN(new Date(endDate))) filter.updatedAt.$lte = new Date(endDate);
        }
        const lessons = await Lessons.find(filter)
            .skip(skip)
            .limit(parsePageSize)
            .select("_id name type isFreePreview updatedAt")
            .lean();
        const total = await Lessons.countDocuments(filter);
        return res.status(200).json({ data: lessons, pagination: {
            total, page: parsePage, pageSize: parsePageSize, totalPages: Math.ceil(total/parsePageSize)
        } });
    } catch (err) {
        console.error({ position: "Get Lesson By Tutor", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getLessonById = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // check lesson id
        const { lesson_id } = req.params;
        if (!lesson_id) return res.status(404).json({ message: "The lesson was not found." });
        // query lesson
        const lesson = await Lessons.findOne({
            _id: new mongoose.Types.ObjectId(lesson_id),
            createdBy: new mongoose.Types.ObjectId(_id)
        });
        return res.status(200).json({ data: lesson });
    } catch (err) {
        console.error({ position: "Get Lesson By Id", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const updateLesson = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // check lesson id
        const { lesson_id } = req.params;
        if (!lesson_id) return res.status(404).json({ message: "The lesson was not found." });
        // check request
        const { error } = LessonBlueprint.validate(req.body, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        // check owner
        const lesson = await Lessons.findOne({
            _id: new mongoose.Types.ObjectId(lesson_id),
            createdBy: new mongoose.Types.ObjectId(_id)
        });
        if (!lesson) return res.status(403).json({ message: "The lesson must be updated by the owner." });
        // update lesson
        await Lessons.findByIdAndUpdate(lesson_id, {
            ...req.body,
            main_content: HTMLsanitization(req.body.main_content),
            updatedBy: new mongoose.Types.ObjectId(_id)
        });
    } catch (err) {
        console.error({ position: "Update Lesson", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const deleteLesson = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // check lesson id
        const { lesson_id } = req.params;
        if (!lesson_id) return res.status(404).json({ message: "The lesson was not found." });
        // check owner
        const lesson = await Lessons.findOne({
            _id: new mongoose.Types.ObjectId(lesson_id),
            createdBy: new mongoose.Types.ObjectId(_id)
        });
        if (!lesson) return res.status(403).json({ message: "The lesson must be deleted by the owner." });
        // delete lesson
        await Lessons.findByIdAndDelete(lesson_id);
        return res.status(200).json({ message: "The lesson was deleted successfully." });
    } catch (err) {
        console.error({ position: "Delete Lesson", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const HTMLsanitization = (htmlContent) => {
    const allowedTags = [
        "p", "strong", "em", "ul", "li", "a", "ol", "br",
        "h1", "h2", "h3", "h4", "h5", "h6", 
        "blockquote", "code", "hr", "pre"
    ];
    return purify.sanitize(htmlContent, {
        ALLOWED_TAGS: allowedTags
    });
}

module.exports = {
    createLesson,
    getLessonById,
    updateLesson,
    deleteLesson,
    getLessonByTutor
}