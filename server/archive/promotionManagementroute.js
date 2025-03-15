const express = require("express");
const {
  getAllPromotion,
  createPromotion,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getApiMessage,
} = require("../controllers/promotionManagement"); 
// const { authUser } = require("../middlewares/auth"); 

const router = express.Router();

router.get("/", getApiMessage);
router.get("/getAllUsers", getAllPromotion);
router.post("/createPromotion", createPromotion);
router.get("/getPromotion/:id", getPromotionById);
router.put("/updatePromotion/:id", updatePromotion);
router.delete("/deletePromotion/:id", deletePromotion);

module.exports = router;
