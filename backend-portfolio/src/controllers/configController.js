const SiteConfig = require('../models/SiteConfig');
const { validationResult } = require('express-validator');

// @desc    Obter configurações do site
// @route   GET /api/config
// @access  Público
exports.getConfig = async (req, res) => {
  try {
    // Buscar configuração ou criar uma padrão se não existir
    let config = await SiteConfig.findOne();
    
    if (!config) {
      config = await SiteConfig.create({
        contactEmail: process.env.DEFAULT_CONTACT_EMAIL || 'contato@tkprod.com.br',
        socialLinks: {
          instagram: '',
          youtube: '',
          vimeo: ''
        }
      });
    }
    
    res.json({
      contactEmail: config.contactEmail,
      socialLinks: config.socialLinks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao obter configurações'
      }
    });
  }
};

// @desc    Atualizar configurações do site
// @route   PUT /api/config
// @access  Privado/Admin
exports.updateConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Erro de validação',
          details: errors.array()
        }
      });
    }
    
    // Buscar configuração ou criar uma padrão se não existir
    let config = await SiteConfig.findOne();
    
    if (!config) {
      config = new SiteConfig({
        contactEmail: req.body.contactEmail || process.env.DEFAULT_CONTACT_EMAIL || 'contato@tkprod.com.br',
        socialLinks: {
          instagram: req.body.socialLinks?.instagram || '',
          youtube: req.body.socialLinks?.youtube || '',
          vimeo: req.body.socialLinks?.vimeo || ''
        }
      });
    } else {
      // Atualizar campos
      config.contactEmail = req.body.contactEmail || config.contactEmail;
      
      if (req.body.socialLinks) {
        config.socialLinks.instagram = req.body.socialLinks.instagram !== undefined 
          ? req.body.socialLinks.instagram 
          : config.socialLinks.instagram;
          
        config.socialLinks.youtube = req.body.socialLinks.youtube !== undefined 
          ? req.body.socialLinks.youtube 
          : config.socialLinks.youtube;
          
        config.socialLinks.vimeo = req.body.socialLinks.vimeo !== undefined 
          ? req.body.socialLinks.vimeo 
          : config.socialLinks.vimeo;
      }
    }
    
    config.updatedAt = Date.now();
    
    await config.save();
    
    res.json({
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao atualizar configurações'
      }
    });
  }
};
