const express = require("express");
const {
    createLesson,
    getLessonByTutor,
    getLessonById,
    updateLesson,
    deleteLesson
} = require("../controllers/lessonController");
const { verifyToken, verifyRole } = require("../middlewares/auth");

const router = express.Router();

// only tutor
router.post("/lesson/create", verifyToken, verifyRole(["Tutor"]), createLesson);
router.get("/lesson/filter", verifyToken, verifyRole(["Tutor"]), getLessonByTutor);
router.get("/lesson/id/:lesson_id", verifyToken, verifyRole(["Tutor"]), getLessonById);
router.put("/lesson/update/:lesson_id", verifyToken, verifyRole(["Tutor"]), updateLesson);
router.delete("/lesson/delete/:lesson_id", verifyToken, verifyRole(["Tutor"]), deleteLesson);

module.exports = router;