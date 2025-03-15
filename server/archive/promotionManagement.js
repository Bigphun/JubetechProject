const mongoose = require("mongoose");
const Promotion = require("../models/Promotion");

// Test Backend API
const getApiMessage = (req, res) => {
    res.send("This is the backend of the jubeTech app");
  };

// Get All Promotion
const getAllPromotion = async (req, res) => {
    try {
        const promotions = await Promotion.find()
        res.status(200).json(promotions);
    } catch (err) {
        res.status(400).json({ message: "Error fetching promotions", error: err.message});
    }
};

// Get Promotion by ID
const getPromotionById = async (req, res) => {
    try {
        const promotions = await Promotion.findById(req.params.id);
        if (!promotions) return res.status(404).json({ message: "Promotion not found"});
        res.status(200).json(promotions)
    } catch (err) {
        res.status(400).json({ message: "Error fetching promotion", error: err.message});
    }
};

// Create Promotion
const createPromotion = async (req, res) => {
    try {
        res.status(201).json("newPromotion");
    } catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({
          message: 'There was an error creating the promotion',
          error: error.message,
        });
    }
};

// Update Promotion
const updatePromotion = async (req, res) => {
    try {
        res.status(200).json({
            message: "Promotion updated successfully",
            // user: user,
          });
    } catch (err) {
        res.status(400).json({ message: "Error updating promotion", error: err.message });
    }
};

// Delete Promotion
const deletePromotion = async (req, res) => {
    try {
        const deletedPromotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!deletedPromotion) return res.status(404).json({ message: "Promotion not found"});
        res.status(200).json({ message: "Promotion delete successfully"}); 
    } catch (err) {
        res.status(400).json({ message: "Error deleting promotion", error: err.message});
    }
};

module.exports = {
    createPromotion,
    getAllPromotion,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    getApiMessage
};