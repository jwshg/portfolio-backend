const mongoose = require('mongoose');

const SiteConfigSchema = new mongoose.Schema({
  contactEmail: {
    type: String,
    required: [true, 'Email de contacto é obrigatório'],
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, forneça um email válido']
  },
  socialLinks: {
    instagram: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    vimeo: {
      type: String,
      trim: true
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar a data de modificação
SiteConfigSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('SiteConfig', SiteConfigSchema);
