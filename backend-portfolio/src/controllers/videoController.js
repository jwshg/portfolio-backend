const Video = require('../models/Video');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Obter todos os vídeos
// @route   GET /api/videos
// @access  Público
exports.getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const lang = req.query.lang || 'pt';
    
    // Construir query
    let query = {};
    
    // Filtrar por categoria
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Pesquisar por título ou descrição
    if (search) {
      query.$or = [
        { [`title.${lang}`]: { $regex: search, $options: 'i' } },
        { [`description.${lang}`]: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Contar total de documentos
    const total = await Video.countDocuments(query);
    
    // Ordenação
    let sort = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split('_');
      sort[field] = order === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 }; // Padrão: mais recentes primeiro
    }
    
    // Executar query
    const videos = await Video.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Calcular páginas
    const pages = Math.ceil(total / limit);
    
    res.json({
      videos,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao obter vídeos'
      }
    });
  }
};

// @desc    Obter um vídeo específico
// @route   GET /api/videos/:id
// @access  Público
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (video) {
      res.json(video);
    } else {
      res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Vídeo não encontrado'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao obter vídeo'
      }
    });
  }
};

// @desc    Criar um novo vídeo
// @route   POST /api/videos
// @access  Privado/Admin
exports.createVideo = async (req, res) => {
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
    
    // Verificar se a categoria existe
    const categoryExists = await Category.findOne({ categoryId: req.body.category });
    if (!categoryExists) {
      return res.status(400).json({
        error: {
          code: 'invalid_category',
          message: 'Categoria não existe'
        }
      });
    }
    
    const video = new Video({
      title: {
        pt: req.body.title.pt,
        en: req.body.title.en
      },
      description: {
        pt: req.body.description.pt,
        en: req.body.description.en
      },
      thumbnail: req.body.thumbnail,
      videoUrl: req.body.videoUrl,
      category: req.body.category,
      featured: req.body.featured || false
    });
    
    const createdVideo = await video.save();
    
    res.status(201).json({
      id: createdVideo._id,
      message: 'Vídeo criado com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao criar vídeo'
      }
    });
  }
};

// @desc    Atualizar um vídeo
// @route   PUT /api/videos/:id
// @access  Privado/Admin
exports.updateVideo = async (req, res) => {
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
    
    // Se a categoria foi fornecida, verificar se existe
    if (req.body.category) {
      const categoryExists = await Category.findOne({ categoryId: req.body.category });
      if (!categoryExists) {
        return res.status(400).json({
          error: {
            code: 'invalid_category',
            message: 'Categoria não existe'
          }
        });
      }
    }
    
    const video = await Video.findById(req.params.id);
    
    if (video) {
      // Atualizar campos
      if (req.body.title) {
        video.title.pt = req.body.title.pt || video.title.pt;
        video.title.en = req.body.title.en || video.title.en;
      }
      
      if (req.body.description) {
        video.description.pt = req.body.description.pt || video.description.pt;
        video.description.en = req.body.description.en || video.description.en;
      }
      
      video.thumbnail = req.body.thumbnail || video.thumbnail;
      video.videoUrl = req.body.videoUrl || video.videoUrl;
      video.category = req.body.category || video.category;
      
      if (req.body.featured !== undefined) {
        video.featured = req.body.featured;
      }
      
      if (req.body.order !== undefined) {
        video.order = req.body.order;
      }
      
      video.updatedAt = Date.now();
      
      const updatedVideo = await video.save();
      
      res.json({
        message: 'Vídeo atualizado com sucesso'
      });
    } else {
      res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Vídeo não encontrado'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao atualizar vídeo'
      }
    });
  }
};

// @desc    Excluir um vídeo
// @route   DELETE /api/videos/:id
// @access  Privado/Admin
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (video) {
      await video.deleteOne();
      res.json({
        message: 'Vídeo excluído com sucesso'
      });
    } else {
      res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Vídeo não encontrado'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao excluir vídeo'
      }
    });
  }
};
