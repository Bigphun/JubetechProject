const express = require("express");
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getApiMessage,
  getRoleByUserId
} = require("../controllers/userManagement"); 
const { verifyToken } = require("../middlewares/auth"); 

const router = express.Router();

router.get("/", getApiMessage);
// router.get("/getAllUsers", authUser, getAllUsers);
// router.post("/createUser", authUser, createUser);
// router.get("/getUser/:id", authUser, getUserById);
// router.put("/updateUser/:id", authUser, updateUser);
// router.delete("/deleteUser/:id", authUser, deleteUser);
router.get("/getAllUsers", getAllUsers);
router.post("/createUser", createUser);
router.get("/getUser/:id", getUserById);
router.put("/updateUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);
router.get("/getRoleByUser", verifyToken, getRoleByUserId);

module.exports = router;
