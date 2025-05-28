const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  sendContactMessage, 
  getContactMessages, 
  updateMessageStatus,
  deleteMessage
} = require('../controllers/contactController');

// Rotas públicas
router.post('/', sendContactMessage);

// Rotas protegidas (admin)
router.get('/messages', protect, admin, getContactMessages);
router.put('/messages/:id', protect, admin, updateMessageStatus);
router.delete('/messages/:id', protect, admin, deleteMessage);

module.exports = router;
