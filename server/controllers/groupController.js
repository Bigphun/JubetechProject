// Joi validate
const Joi = require("joi");
// Schema
const mongoose = require("mongoose");
const Groups = require("../models/Group");

const groupBlueprint = Joi.object({
    name: Joi.string().trim().max(80).required(),
});
const groupBlueprintArr = Joi.object({
    groups: Joi.array().items(groupBlueprint).required().custom((value, helpers) => {
        const names = value.map(group => group.name);
        const filterNames = new Set(names);
        if (filterNames.size !== names.length) return helpers.error("any.custom", { message: "Group names must be unique." });
        return value;
    })
});

const createGroups = async(req, res) => {
    try {
        // check request
        const { error } = groupBlueprintArr.validate(req.body, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        const { _id } = req.verify_user;
        const { groups } = req.body;
        // check groups
        if (!Array.isArray(groups) || groups.length === 0) return res.status(404).json({ message: "Groups were not found." });
        // modify group
        const modifyGroups = groups.map((group) => ({
            ...group,
            createdBy: new mongoose.Types.ObjectId(_id),
            updatedBy: new mongoose.Types.ObjectId(_id)
        }));
        // create group
        await Groups.insertMany(modifyGroups);
        return res.status(201).json({ message: "Groups were created successfully." });
    } catch (err) {
        console.error({ position: "Create Groups", error: err });
        return res.status(409).json({ message: "Group names must be unique." });
    }
}

const getAllGroups = async(_req, res) => {
    try {
        // query group
        const groups = await Groups.find({})
            .select("_id name updatedAt")
            .sort({ updatedAt: -1 })
            .lean();
        return res.status(200).json({ data: groups });
    } catch (err) {
        console.error({ position: "Get All Groups", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getGroupById = async(req, res) => {
    try {
        // check group id
        const { group_id } = req.params;
        if (!group_id) return res.status(404).json({ message: "The group was not found." });
        // query group
        const group = await Groups.findById(group_id)
            .select("_id name updatedAt")
            .lean();
        return res.status(200).json({ data: [group] });
    } catch (err) {
        console.error({ position: "Get Group By Id", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const updateGroup = async(req, res) => {
    try {
        // check group id
        const { group_id } = req.params;
        if (!group_id) res.status(404).json({ message: "The group was not found." });
        // check request
        const { name } = req.body;
        const { error } = groupBlueprint.validate({ name }, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        // update group
        const { _id } = req.verify_user;
        await Groups.findByIdAndUpdate(group_id, {
            name,
            updatedBy: new mongoose.Types.ObjectId(_id)
        });
        return res.status(200).json({ message: "The group was updated successfully." });
    } catch (err) {
        console.error({ position: "Update Group", error: err });
        return res.status(409).json({ message: "Group names must be unique." });
    }
}

const deleteGroups = async(req, res) => {
    try {
        // check group ids
        const { group_ids } = req.body;
        if (!Array.isArray(group_ids) || group_ids.length === 0) return res.status(404).json({ message: "Groups were not found." });
        // delete many group
        const modify_group_ids = group_ids.map((group) => new mongoose.Types.ObjectId(group));
        await Groups.deleteMany({ _id: { $in: modify_group_ids } });
        return res.status(200).json({ message: "Groups were deleted successfully." });
    } catch (err) {
        console.error({ position: "Delete Groups", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

module.exports = {
    createGroups,
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroups
}