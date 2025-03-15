// Joi validate
const Joi = require("joi");
// schema
const mongoose = require("mongoose");
const Sections = require("../models/Section");

const SectionBlueprint = Joi.object({
    title: Joi.string().trim().max(70).required(),
    lesson_ids: Joi.array().items(Joi.string())
});
const SectionArrBlueprint = Joi.object({
    sections: Joi.array().items(SectionBlueprint).required()
});

const createSections = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // check request
        const { error } = SectionArrBlueprint.validate(req.body, { abortEarly: false });
        if (error && error.details) {
            const modifyDetail = error.details.map(err => ({
                path: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: modifyDetail });
        }
        // create section
        const { sections } = req.body;
        const modifySections = sections.map(secion => ({
            ...secion,
            lesson_ids: secion.lesson_ids.map(lesson_id => new mongoose.Types.ObjectId(lesson_id)),
            createdBy: new mongoose.Types.ObjectId(_id),
            updatedBy: new mongoose.Types.ObjectId(_id)
        }));
        await Sections.insertMany(modifySections);
        return res.status(200).json({ message: "Sections were created successfully." });
    } catch (err) {
        console.error({ position: "Create Section", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getSectionById = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // check section id
        const { section_id } = req.params;
        if (!section_id) return res.status(404).json({ message: "The section was not found" });
        // query section
        const section = await Sections.findOne({
            _id: new mongoose.Types.ObjectId(section_id),
            createdBy: new mongoose.Types.ObjectId(_id)
        }).populate("lesson_ids");
        return res.status(200).json({ data: section });
    } catch (err) {
        console.error({ position: "Get Section By Id", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const updateSection = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ messasge: "The user was not found." });
        // check section id
        const { section_id } = req.paarms;
        if (!section_id) return res.status(404).json({ message: "The section was not found." });
        // check request
        const { error } = SectionBlueprint.validate(req.body, { abortEarly: false });
        if (error && error.details) return res.status(400).json({ message: error.details });
        // check owner
        const section = await Sections.findOne({
            _id: new mongoose.Types.ObjectId(section_id),
            createdBy: new mongoose.Types.ObjectId(_id)
        });
        if (!section) return res.status(403).json({ message: "The section must be updated by the owner." })
        // update section
        const { title, lesson_ids } = req.body;
        await Sections.findByIdAndUpdate(section_id, {
            title,
            lesson_ids: lesson_ids.map(lesson_id => new mongoose.Types.ObjectId(lesson_id)),
            updatedBy: new mongoose.Types.ObjectId(_id)
        });
        return res.status(200).json({ message: "The section was updated successfully." });
    } catch (err) {
        console.error({ position: "Update Section", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const deleteSection = async(req, res) => {
    try {
        // check user id
        const { _id } = req.verify_user;
        if (!_id) return res.status(404).json({ message: "The user was not found." });
        // check section id
        const { section_id } = req.params;
        if (!section_id) return res.status(404).json({ message: "The section was not found." });
        // check owner
        const section = await Sections.findOne({
            _id: new mongoose.Types.ObjectId(section_id),
            createdBy: new mongoose.Types.ObjectId(_id)
        });
        if (!section) return res.status(403).json({ message: "The section must be deleted by the owner." });
        // delete section
        await Sections.findByIdAndDelete(section_id);
        return res.status(200).json({ message: "The section was deleted successfully." });
    } catch (err) {
        console.error({ position: "Delete Section", error: err });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

module.exports = {
    createSections,
    getSectionById,
    updateSection,
    deleteSection
}