const express = require("express");
const {
    createCategories,
    getAllCategories,
    paginationCategories,
    getCategoryById,
    searchCategories,
    updateCategory,
    deleteCategories
} = require("../controllers/categoryController");
const { verifyToken, verifyRole } = require("../middlewares/auth");

const router = express.Router();

// public access
router.get("/category/all", getAllCategories);
router.get("/category/pagination", paginationCategories);
router.get("/category/search", searchCategories);
// only admin
router.post("/category/create", verifyToken, verifyRole(["Admin"]), createCategories);
router.get("/category/id/:category_id", verifyToken, verifyRole(["Admin"]), getCategoryById);
router.put("/category/update/:category_id", verifyToken, verifyRole(["Admin"]), updateCategory);
router.delete("/category/delete", verifyToken, verifyRole(["Admin"]), deleteCategories);

module.exports = router;