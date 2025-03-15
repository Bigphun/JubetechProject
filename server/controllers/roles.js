const Role = require("../models/Role");

// Get All Roles
const getAllRoles = async (req, res) => {
    try {
      const roles = await Role.find(); 
      res.status(200).json(roles);
    } catch (err) {
      res.status(500).json({ message: "Error fetching roles", error: err.message });
    }
  };

// Get Role by ID
const getRoleById = async (req, res) => {
    try {
      const role = await Role.findById(req.params.id);
      if (!role) return res.status(404).json({ message: "Role not found" });
      res.status(200).json(role);
    } catch (err) {
      res.status(400).json({ message: "Error fetching role", error: err.message });
    }
  };

// Create Role
const createRole = async (req, res) => {
    try {
        const { role_name } = req.body;
        const newRole = new Role({ role_name });
        await newRole.save();
        res.status(201).json({ message: "Role created successfully", role: newRole });
      } catch (err) {
        res.status(400).json({ message: "Error creating role", error: err.message });
      }
    };

// Update Role
const updateRole = async (req, res) => {
    try {
        const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRole) return res.status(404).json({ message: "Role not found" });
        res.status(200).json({ message: "Role updated successfully", role: updatedRole });
    } catch (err) {
        res.status(400).json({ message: "Error updating role", error: err.message });
    }
}

// Delete Role
const deleteRole = async (req, res) => {
    try {
        const deletedRole = await Role.findByIdAndDelete(req.params.id);
        if (!deletedRole) return res.status(404).json({ message: "Role not found" });
        res.status(200).json({ message: "Role deleted successfully" });
      } catch (err) {
        res.status(400).json({ message: "Error deleting role", error: err.message });
      }
    };

module.exports = { 
    getAllRoles, 
    getRoleById, 
    createRole, 
    updateRole, 
    deleteRole };