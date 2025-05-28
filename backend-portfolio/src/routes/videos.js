const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  getVideos, 
  getVideoById, 
  createVideo, 
  updateVideo, 
  deleteVideo 
} = require('../controllers/videoController');

// Rotas públicas
router.get('/', getVideos);
router.get('/:id', getVideoById);

// Rotas protegidas (admin)
router.post('/', protect, admin, createVideo);
router.put('/:id', protect, admin, updateVideo);
router.delete('/:id', protect, admin, deleteVideo);

module.exports = router;
