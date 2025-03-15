// Joi vlaidate
const Joi = require("joi");
// other
const { v4:uuidv4 } = require("uuid");
const slugify = require("slugify");
// schema
const mongoose = require("mongoose");
const Courses = require("../models/Course");

const CourseBlueprint = Joi.object({
    // Required section
    thumbnail: Joi.string().trim().required(),
    title: Joi.string().trim().min(10).max(150).required(),
    usePoint: Joi.boolean().required(),
    price: Joi.number().integer().min(200).max(2000).required(),
    point: Joi.number().integer().min(100).max(1000).required(),
    objectives: Joi.array().items(Joi.string().trim().max(100).required()).required(),
    status: Joi.string().valid("draft", "published", "archived").required(),
    useCertificate: Joi.boolean().required(),
    duration: Joi.number().integer().required(),
    level: Joi.string().valid("beginner", "intermediate", "expert").required(),
    // Optional section
    pretest: Joi.string(),
    posttest: Joi.string(),
    description: Joi.string().max(500),
    note: Joi.string().trim().max(7000),
    group_ids: Joi.array().items(Joi.string().trim()),
    section_ids: Joi.array().items(Joi.string().trim()),
});

const createCourse = async(req, res) => {
    try {
        // check tutor
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The tutor was not found." });
        // check request
        const { error } = CourseBlueprint.validate(req.body, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        const { title, price, point, group_ids, section_ids, duration, pretest, posttest } = req.body;
        // check number
        const parsePrice = parseInt(price);
        const parsePoint = parseInt(point);
        const parseDuration = Number(duration);
        if (isNaN(parsePrice) || isNaN(parsePoint) || isNaN(parseDuration)) return res.status(400).json({ message: "The price, point or duration has an invalid format." });
        // check title
        const course = await Courses.findOne({ title }).select("title").lean();
        if (course) return res.status(409).json({ message: "The course with this title already exists." });
        // create course
        let generateSlug = slugify(title);
        if (!generateSlug) generateSlug = uuidv4();
        await Courses.create({
            ...req.body,
            price: parsePrice,
            point: parsePoint,
            group_ids: group_ids.map(group_id => new mongoose.Types.ObjectId(group_id)),
            section_ids: section_ids.map(section_id => new mongoose.Types.ObjectId(section_id)),
            instructor: new mongoose.Types.ObjectId(_id),
            slug: generateSlug,
            pretest: pretest ? new mongoose.Types.ObjectId(pretest) : null,
            posttest: posttest ? new mongoose.Types.ObjectId(posttest) : null,
            createdBy: new mongoose.Types.ObjectId(_id),
            updatedBy: new mongoose.Types.ObjectId(_id),
        });
        return res.status(201).json({ message: "The course was created successfully." });
    } catch (err) {
        console.error({ position: "Create Course", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getCoursesByTutor = async(req, res) => {
    try {
        // check user
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // request
        const { title, rating, duration, group_ids, minPrice, maxPrice, minPoint, maxPoint, sort, page = 1, pageSize = 20, useCertificate } = req.query;
        // check page and pageSize
        const parsePage = parseInt(page);
        const parsePageSize = parseInt(pageSize);
        if (isNaN(parsePage) || isNaN(parsePageSize)) return res.status(400).json({ message: "The page or pageSize has an invalid format." });
        // prepare filter
        let filter = {};
        filter.createdBy = new mongoose.Types.ObjectId(_id)
        if (title) filter.title = { $regex: title, $options: "i" };
        if (rating) filter.rating = { $gte: Number(rating || 0) };
        if (duration) filter.duration = { $gte: Number(duration || 0) };
        if (useCertificate) filter.useCertificate = useCertificate;
        if (group_ids) filter.group_ids = { $elemMatch: { $in: group_ids.split(",") } };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice || 0);
            if (maxPrice) filter.price.$lte = Number(maxPrice || 0);
        }
        if (minPoint || maxPoint) {
            filter.point = {};
            if (minPoint) filter.point.$gte = Number(minPoint || 0);
            if (maxPoint) filter.point.$lte = Number(maxPoint || 0);
        }
        const sortOptions = {};
        if (sort) {
            const fields = sort.split(",");
            fields.forEach(field => {
                const order = field.startsWith("-") ? -1 : 1;
                const key = field.replace("-", "");
                sortOptions[key] = order;
            });
        } else {
            sortOptions.updatedAt = -1;
        }
        const skip = (parsePage - 1) * parsePageSize;
        const courses = await Courses.find(filter)
            .populate({
                path: "group_ids",
                select: "_id name"
            })
            .populate({
                path: "instructor",
                select: "firstname lastname -_id"
            })
            .populate({
                path: "section_ids",
                select: "_id title lesson_ids",
                populate: {
                    path: "lesson_ids",
                    select: "_id name type duration order isFreePreview"
                }
            })
            .populate({ path: "pretest", select: "title -_id" })
            .populate({ path: "posttest", select: "title -_id" })
            .sort(sortOptions)
            .skip(skip)
            .limit(parsePageSize)
            .lean();
        const total = await Courses.countDocuments(filter);
        return res.status(200).json({ data: courses, pagination: {
            total, page:parsePage , pageSize:parsePageSize, totalPages: Math.ceil(total/parsePageSize) 
        } });
    } catch (err) {
        console.error({ position: "Get Courses By Tutor", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getAllCourses = async(_req, res) => {
    try {
        const courses = await Courses.find({ status: "published" })
            .select("_id thumbnail title description usePoint price point group_ids rating instructor student_enrolled useCertificate updatedAt slug duration level")
            .populate({ path: "group_ids", select: "_id name" })
            .populate({ path: "instructor", select: "firstname lastname -_id" })
            .lean();
        return res.status(200).json({ data: courses });
    } catch (err) {
        console.error({ position: "Get All Courses", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const paginationCourse = async(req, res) => {
    try {
        const { title, rating, duration, group_ids, minPrice, maxPrice, minPoint, maxPoint, sort, page = 1, pageSize = 20, useCertificate } = req.query;
        // check page and pageSize
        const parsePage = parseInt(page);
        const parsePageSize = parseInt(pageSize);
        if (isNaN(parsePage) || isNaN(parsePageSize)) return res.status(400).json({ message: "The page or pageSize has an invalid format." });
        // prepare filter
        let filter = {};
        filter.status = "published";
        if (title) filter.title = { $regex: title, $options: "i" };
        if (rating) filter.rating = { $gte: Number(rating || 0) };
        if (duration) filter.duration = { $gte: Number(duration || 0) };
        if (group_ids) filter.group_ids = { $elemMatch: { $in: group_ids.split(",") } };
        if (useCertificate) filter.useCertificate = Boolean(useCertificate);
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice || 0);
            if (maxPrice) filter.price.$lte = Number(maxPrice || 0);
        }
        if (minPoint || maxPoint) {
            filter.point = {};
            if (minPoint) filter.point.$gte = Number(minPoint || 0);
            if (maxPoint) filter.point.$lte = Number(maxPoint || 0);
        }
        const sortOptions = {};
        if (sort) {
            const fields = sort.split(",");
            fields.forEach(field => {
                const order = field.startsWith("-") ? -1 : 1;
                const key = field.replace("-", "");
                sortOptions[key] = order;
            });
        } else {
            sortOptions.updatedAt = -1;
        }
        const skip = (parsePage - 1) * parsePageSize;
        const courses = await Courses.find(filter)
            .select("_id thumbnail title description usePoint price point group_ids rating instructor student_enrolled useCertificate updatedAt slug useCertificate duration level")
            .populate({ path: "group_ids", select: "_id name" })
            .populate({ path: "instructor", select: "firstname lastname -_id" })
            .sort(sortOptions)
            .skip(skip)
            .limit(parsePageSize)
            .lean();
        const total = await Courses.countDocuments(filter);
        return res.status(200).json({ data: courses, pagination: {
            total, page:parsePage , pageSize:parsePageSize, totalPages: Math.ceil(total/parsePageSize) 
        } });
    } catch (err) {
        console.error({ position: "Pagination Course", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getCourseBySlug = async(req, res) => {
    try {
        // check slug
        const { slug } = req.params;
        if (!slug) return res.status(404).json({ message: "The course was not found." });
        // query course
        const course = await Courses.findOne({ slug, status: "published" })
            .select("_id thumbnail title description usePoint price point objectives group_ids section_ids status rating instructor student_enrolled useCertificate pretest posttest duration level note slug updatedAt")
            .populate({
                path: "group_ids",
                select: "_id name"
            })
            .populate({
                path: "instructor",
                select: "firstname lastname -_id"
            })
            .populate({
                path: "section_ids",
                select: "_id title lesson_ids",
                populate: {
                    path: "lesson_ids",
                    select: "_id name type duration order isFreePreview"
                }
            })
            .populate({ path: "pretest", select: "title -_id" })
            .populate({ path: "posttest", select: "title -_id" })
            .lean();
        return res.status(200).json({ data: course });
    } catch (err) {
        console.error({ position: "Get Course By Slug", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getCourseById = async(req, res) => {
    try {
        // check course id
        const { course_id } = req.params;
        if (!course_id) return res.status(404).json({ message: "The course was not found." });
        // query course
        const course = await Courses.findById(course_id)
            .populate({
                path: "group_ids",
                select: "_id name"
            })
            .populate({
                path: "instructor",
                select: "firstname lastname"
            })
            .populate({
                path: "section_ids",
                select: "_id title lesson_ids",
                populate: {
                    path: "lesson_ids",
                    select: "_id name type duration order isFreePreview"
                }
            })
            .populate({ path: "pretest", select: "title -_id" })
            .populate({ path: "posttest", select: "title -_id" })
            .lean();
        return res.status(200).json({ data: course });
    } catch (err) {
        console.error({ position: "Get Course By Id", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const updateCourse = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // check course id
        const { course_id } = req.params;
        if (!course_id) return res.status(404).json({ message: "The course was not found." });
        // check request
        const { error } = CourseBlueprint.validate(req.body, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        const { title, price, point, group_ids, section_ids, duration, pretest, posttest } = req.body;
        // check number
        const parsePrice = parseInt(price);
        const parsePoint = parseInt(point);
        const parseDuration = Number(duration);
        if (isNaN(parsePrice) || isNaN(parsePoint) || isNaN(parseDuration)) return res.status(400).json({ message: "The price, point or duration has an invalid format." });
        // check title
        const check_title = await Courses.findOne({ _id: { $ne: course_id }, title }).select("title").lean();
        if (check_title) return res.status(409).json({ message: "The course with this title already exists." });
        // check owner
        const check_owner = await Courses.findOne({
            _id: new mongoose.Types.ObjectId(course_id),
            createdBy: new mongoose.Types.ObjectId(_id)
        });
        if (!check_owner) return res.status(403).json({ message: "The course must be updated by the owner." });
        // update course
        let generateSlug = slugify(title);
        if (!generateSlug) generateSlug = uuidv4();
        await Courses.findByIdAndUpdate(course_id, {
            ...req.body,
            price: parsePrice,
            point: parsePoint,
            group_ids: group_ids.map(group_id => new mongoose.Types.ObjectId(group_id)),
            section_ids: section_ids.map(section_id => new mongoose.Types.ObjectId(section_id)),
            instructor: new mongoose.Types.ObjectId(_id),
            slug: generateSlug,
            pretest: pretest ? new mongoose.Types.ObjectId(pretest) : null,
            posttest: posttest ? new mongoose.Types.ObjectId(posttest) : null,
            updatedBy: new mongoose.Types.ObjectId(_id),
        });
        return res.status(200).json({ message: "The course was updated successfully." });
    } catch (err) {
        console.error({ position: "Update Course", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const deleteCourse = async(req, res) => {
    try {
        // check course id
        const { course_id } = req.params;
        if (!course_id) return res.status(404).json({ message: "The course was not found." });
        // check owner
        const check_owner = await Courses.findOne({
            _id: new mongoose.Types.ObjectId(course_id),
            createdBy: new mongoose.Types.ObjectId(_id)
        });
        if (!check_owner) return res.status(403).json({ message: "The course must be updated by the owner." });
        // delete course
        await Courses.findByIdAndDelete(course_id);
        return res.status(200).json({ message: "The course was deleted successfully." });
    } catch (err) {
        console.error({ position: "Delete Course", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

module.exports = {
    createCourse,
    getCoursesByTutor,
    getAllCourses,
    paginationCourse,
    getCourseBySlug,
    getCourseById,
    updateCourse,
    deleteCourse
}