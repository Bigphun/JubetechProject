const mongoose = require("mongoose");
const Course = require("../models/Course");

// Get all Courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(400).json({ message: "Error fetching courses", error: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const { title, isPoint, price, score } = req.body;
        const newCourse = new Course({
            title,
            description: req.body.description || "",
            isPoint,
            price,
            score,
            objectives: req.body.objectives || [],
            categories: req.body.categories || [],
        });
        await newCourse.save();
        res.status(201).json({ message: "Course created successfully", course: newCourse });
    } catch (error) {
        res.status(500).json({ message: "Error creating course", error: error.message });
    }
};

module.exports = {
    getAllCourses,
    createCourse
};