import express from 'express';
import Role from '../models/Role.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all roles with their permissions
router.get('/', protect, async (req, res) => {
  try {
    const roles = await Role.find();
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single role
router.get('/:id', protect, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update role permissions (Main Admin only)
router.put('/:id', protect, authorize('main_admin'), async (req, res) => {
  try {
    const { permissions, description } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (permissions) role.permissions = permissions;
    if (description) role.description = description;

    await role.save();

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;