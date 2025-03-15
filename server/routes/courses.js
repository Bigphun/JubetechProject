const express = require("express");
const {
    createCourse,
    getCoursesByTutor,
    getAllCourses,
    paginationCourse,
    getCourseBySlug,
    getCourseById,
    updateCourse,
    deleteCourse
} = require("../controllers/courseController");
const { verifyToken, verifyRole } = require("../middlewares/auth");

const router = express.Router();

// public access
router.get("/course/all", getAllCourses);
router.get("/course/pagination", paginationCourse);
router.get("/course/slug/:slug", getCourseBySlug);
// private access
router.get("/course/tutor", verifyToken, verifyRole(["Tutor"]), getCoursesByTutor);
router.post("/course/create", verifyToken, verifyRole(["Tutor"]), createCourse);
router.get("/course/id/:course_id", verifyToken, verifyRole(["Tutor"]), getCourseById);
router.put("/course/update/:course_id", verifyToken, verifyRole(["Tutor"]), updateCourse);
router.delete("/course/delete/:course_id", verifyToken, verifyRole(["Tutor"]), deleteCourse);

module.exports = router;