const express = require("express");
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require("../controllers/roles"); 

const router = express.Router();

router.get("/getAllRoles", getAllRoles);
router.get("/getRole/:id", getRoleById);
router.post("/createRole", createRole);
router.put("/updateRole/:id", updateRole);  
router.delete("/deleteRole/:id", deleteRole);

module.exports = router;