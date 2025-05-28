const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  getConfig, 
  updateConfig 
} = require('../controllers/configController');

// Rotas públicas
router.get('/', getConfig);

// Rotas protegidas (admin)
router.put('/', protect, admin, updateConfig);

module.exports = router;
