const express = require("express");
const {
    getAllCourses,
    createCourse
} = require("../controllers/course");

const router = express.Router();

router.get("/getAllCourses", getAllCourses);
router.post("/createCourse", createCourse);

module.exports = router;