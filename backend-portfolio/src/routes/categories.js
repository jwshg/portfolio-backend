const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryVideos
} = require('../controllers/categoryController');

// Rotas públicas
router.get('/', getCategories);
router.get('/:id/videos', getCategoryVideos);

// Rotas protegidas (admin)
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
