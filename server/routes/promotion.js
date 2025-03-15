const express = require("express");
const {
    getAllPromotions,
    createPromotion,
    getPromotionById,
    updatePromotion,
    deletePromotion,
} = require("../controllers/promotionManagement");

const router = express.Router();

router.get("/getAllPromotions", getAllPromotions);
router.post("/createPromotion", createPromotion);
router.get("/getPromotion/:id", getPromotionById);
router.put("/updatePromotion/:id", updatePromotion);
router.delete("/deletePromotion/:id", deletePromotion);

module.exports = router;