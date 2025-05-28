const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: [true, 'ID da categoria é obrigatório'],
    unique: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'ID da categoria deve conter apenas letras minúsculas, números e hífens']
  },
  name: {
    pt: {
      type: String,
      required: [true, 'Nome em português é obrigatório'],
      trim: true
    },
    en: {
      type: String,
      required: [true, 'Nome em inglês é obrigatório'],
      trim: true
    }
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
CategorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
