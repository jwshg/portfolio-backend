const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    pt: {
      type: String,
      required: [true, 'Título em português é obrigatório'],
      trim: true
    },
    en: {
      type: String,
      required: [true, 'Título em inglês é obrigatório'],
      trim: true
    }
  },
  description: {
    pt: {
      type: String,
      trim: true
    },
    en: {
      type: String,
      trim: true
    }
  },
  thumbnail: {
    type: String,
    required: [true, 'URL da miniatura é obrigatória'],
    trim: true,
    match: [/^https?:\/\/.*/, 'Por favor, forneça uma URL válida para a miniatura']
  },
  videoUrl: {
    type: String,
    required: [true, 'URL do vídeo é obrigatória'],
    trim: true,
    match: [/^https?:\/\/.*/, 'Por favor, forneça uma URL válida para o vídeo']
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    ref: 'Category',
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar a data de modificação
VideoSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Video', VideoSchema);
