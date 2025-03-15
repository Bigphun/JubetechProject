const express = require("express");
const {
    createGroups,
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroups
} = require("../controllers/groupController");
const { verifyToken, verifyRole } = require("../middlewares/auth");

const router = express.Router();

// public access
router.get("/group/all", getAllGroups);
// only admin
router.post("/group/create", verifyToken, verifyRole(["Admin"]), createGroups);
router.get("/group/id/:group_id", verifyToken, verifyRole(["Admin"]), getGroupById);
router.put("/group/update/:group_id", verifyToken, verifyRole(["Admin"]), updateGroup);
router.delete("/group/delete", verifyToken, verifyRole(["Admin"]), deleteGroups);

module.exports = router;