const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  login, 
  register, 
  getProfile, 
  updateProfile, 
  resetPassword 
} = require('../controllers/authController');

// Rotas públicas
router.post('/login', login);
router.post('/reset-password', resetPassword);

// Rotas protegidas
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Rota de registo (apenas para setup inicial)
router.post('/register', register);

module.exports = router;
