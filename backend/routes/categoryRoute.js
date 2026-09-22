import express from 'express';
import mongoose from 'mongoose';
import dynamicCategoryModel from '../models/categoryModel.js';

const categoryRouter = express.Router();

// In-memory fallback categories if MongoDB is offline or in fallback mode
let mockCategories = [];

// Get all categories (tree or flat list)
categoryRouter.get('/list', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const categories = await dynamicCategoryModel.find({}).sort({ order: 1 });
            return res.json({ success: true, categories });
        }
        res.json({ success: true, categories: mockCategories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.json({ success: true, categories: mockCategories });
    }
});

// Admin add category
categoryRouter.post('/add', async (req, res) => {
    try {
        const { name, parentId, level, order } = req.body;
        if (!name || !name.trim()) {
            return res.json({ success: false, message: "Category name is required" });
        }
        const cleanName = name.trim();
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const pId = parentId ? String(parentId) : null;
        const catLevel = Number(level) || 1;
        const catOrder = Number(order) || 0;

        if (mongoose.connection.readyState === 1) {
            const existing = await dynamicCategoryModel.findOne({ 
                name: { $regex: new RegExp(`^${cleanName}$`, 'i') }, 
                parentId: pId 
            });
            if (existing) {
                return res.json({ success: false, message: "Category with this name already exists under this parent" });
            }

            const newCategory = new dynamicCategoryModel({
                name: cleanName,
                slug: `${slug}-${Date.now().toString().slice(-4)}`,
                parentId: pId,
                level: catLevel,
                order: catOrder
            });

            await newCategory.save();
            mockCategories.push({
                _id: newCategory._id.toString(),
                name: cleanName,
                slug: newCategory.slug,
                parentId: pId,
                level: catLevel,
                order: catOrder
            });
            return res.json({ success: true, message: "Category added successfully", category: newCategory });
        }

        // Fallback mode
        const existingMock = mockCategories.find(c => 
            c.name.toLowerCase() === cleanName.toLowerCase() && 
            String(c.parentId || null) === String(pId || null)
        );
        if (existingMock) {
            return res.json({ success: false, message: "Category with this name already exists under this parent" });
        }

        const newMockCat = {
            _id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            name: cleanName,
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            parentId: pId,
            level: catLevel,
            order: catOrder
        };
        mockCategories.push(newMockCat);

        res.json({ success: true, message: "Category added successfully", category: newMockCat });
    } catch (error) {
        console.error('Error adding category:', error);
        res.json({ success: false, message: error.message });
    }
});

// Admin delete category
categoryRouter.post('/remove', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.json({ success: false, message: "Category ID is required" });
        }
        const targetId = String(id);

        if (mongoose.connection.readyState === 1) {
            // Remove the item and its descendants
            await dynamicCategoryModel.deleteMany({ $or: [{ _id: targetId }, { parentId: targetId }] });
        }

        // Also clean up mockCategories (remove target and any children)
        const idsToRemove = new Set([targetId]);
        let changed = true;
        while (changed) {
            changed = false;
            mockCategories.forEach(c => {
                if (c.parentId && idsToRemove.has(String(c.parentId)) && !idsToRemove.has(String(c._id))) {
                    idsToRemove.add(String(c._id));
                    changed = true;
                }
            });
        }
        mockCategories = mockCategories.filter(c => !idsToRemove.has(String(c._id)));

        res.json({ success: true, message: "Category removed successfully" });
    } catch (error) {
        console.error('Error removing category:', error);
        res.json({ success: false, message: error.message });
    }
});

export default categoryRouter;
