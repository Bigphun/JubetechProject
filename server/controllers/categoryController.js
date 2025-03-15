// Joi validate
const Joi = require("joi");
// Schema
const mongoose = require("mongoose");
const Categories = require("../models/Category");

const categoryBlueprint = Joi.object({
    name: Joi.string().trim().max(100).required(),
    group_ids: Joi.array().items(Joi.string()),
});
const categoryBlueprintArr = Joi.object({
    categories: Joi.array().items(categoryBlueprint).required().custom((value, helpers) => {
        const names = value.map(category => category.name);
        const filterNames = new Set(names);
        if (filterNames.size !== names.length) return helpers.error("any.custom", { message: "Category names must be unique." });
        return value;
    })
});

const createCategories = async(req, res) => {
    try {
        // check request
        const { error } = categoryBlueprintArr.validate(req.body, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        // modify categories
        const { _id } = req.verify_user;
        const { categories } = req.body;
        const modifyCategories = categories.map((category) => ({
            ...category,
            group_ids: category.group_ids.map((group) => new mongoose.Types.ObjectId(group)),
            createdBy: new mongoose.Types.ObjectId(_id),
            updatedBy: new mongoose.Types.ObjectId(_id)
        }));
        // create categories
        await Categories.insertMany(modifyCategories);
        return res.status(201).json({ message: "Categories were created successfully." });
    } catch (err) {
        console.error({ position: "Create Categories", error: err });
        return res.status(409).json({ message: "Category names must be unique." });
    }
}

const getAllCategories = async(_req, res) => {
    try {
        // query categories
        const categories = await Categories.find({})
            .select("_id name group_ids updatedAt")
            .sort({ updatedAt: -1 })
            .populate({ path: "group_ids", select: "_id name" })
            .lean();
        return res.status(200).json({ data: categories });
    } catch (err) {
        console.error({ position: "Get All Categories", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const paginationCategories = async(req, res) => {
    try {
        const { page, pageSize } = req.query;
        const parsePage = parseInt(page);
        const parsePageSize = parseInt(pageSize);
        // check page or pageSize
        if (isNaN(parsePage) || isNaN(parsePageSize)) return res.status(400).json({ message: "The page number or page size is invalid." });
        const skip = (parsePage - 1) * parsePageSize;
        // query categories
        const categories = await Categories.find({})
            .select("_id name group_ids updatedAt")
            .sort({ updatedAt: -1 })
            .populate({ path: "group_ids", select: "_id name" })
            .skip(skip)
            .limit(pageSize)
            .lean();
        return res.status(200).json({
            data: categories,
            pagination: {
                total, page:parsePage , pageSize:10, totalPages: Math.ceil(total/10) 
            }
        });
    } catch (err) {
        console.error({ position: "Pagination Categories", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getCategoryById = async(req, res) => {
    try {
        // check category id
        const { category_id } = req.params;
        if (!category_id) return res.status(404).json({ message: "The category was not found." });
        // query category
        const category = await Categories.findById(category_id)
            .select("_id name group_ids updatedAt")
            .populate({ path: "group_ids", select: "_id name" })
            .lean();
        return res.status(200).json({ data: [category] });
    } catch (err) {
        console.error({ position: "Get Category By Id", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const searchCategories = async(req, res) => {
    try {
        const { name, startDate, endDate, page, pageSize, group_ids } = req.query;
        const parsePage = parseInt(page);
        const parsePageSize = parseInt(pageSize);
        // check page and pageSize
        if (isNaN(parsePage) || isNaN(parsePageSize)) return res.status(400).json({ message: "The page number or page size is invalid." });
        const skip = (parsePage - 1) * parsePageSize;
        // prepare filter
        let filter = {};
        if (name) filter.name = { $regex: new RegExp(name, "i") };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate && !isNaN(new Date(startDate))) filter.createdAt.$gte = new Date(startDate);
            if (endDate && !isNaN(new Date(endDate))) filter.createdAt.$lte = new Date(endDate);
        }
        if (group_ids) filter.group_ids = { $elemMatch: { $in: group_ids.split(",") } };
        // query category
        const categories = await Categories.find(filter)
            .select("_id name group_ids updatedAt")
            .populate({ path: "group_ids", select: "_id name" })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parsePageSize)
            .lean();
        return res.status(200).json({ data: categories });
    } catch (err) {
        console.error({ position: "Search Categories", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const updateCategory = async(req, res) => {
    try {
        // check category id
        const { category_id } = req.params;
        if (!category_id) return res.status(404).json({ message: "The category was not found." });
        // check request
        const { name, group_ids } = req.body;
        const { error } = categoryBlueprint.validate({ name, group_ids }, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        // update category
        const { _id } = req.verify_user;
        await Categories.findByIdAndUpdate(category_id, {
            name,
            group_ids: group_ids.map((group) => new mongoose.Types.ObjectId(group)),
            updatedBy: new mongoose.Types.ObjectId(_id)
        });
        return res.status(200).json({ message: "The category was updated successfully." });
    } catch (err) {
        console.error({ position: "Update Category", error: err });
        return res.status(409).json({ message: "Category names must be unique." });
    }
}

const deleteCategories = async(req, res) => {
    try {
        // check group ids
        const { category_ids } = req.body;
        if (!Array.isArray(category_ids) || category_ids.length === 0) return res.status(404).json({ message: "Categories were not found." });
        // delete many category
        const modify_category_ids = category_ids.map((category) => new mongoose.Types.ObjectId(category));
        await Categories.deleteMany({ _id: { $in: modify_category_ids } });
        return res.status(200).json({ message: "Categories were deleted successfully." });
    } catch (err) {
        console.error({ position: "Delete Categories", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

module.exports = {
    createCategories,
    getAllCategories,
    paginationCategories,
    getCategoryById,
    searchCategories,
    updateCategory,
    deleteCategories
}