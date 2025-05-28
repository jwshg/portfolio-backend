const Category = require('../models/Category');
const Video = require('../models/Video');
const { validationResult } = require('express-validator');

// @desc    Obter todas as categorias
// @route   GET /api/categories
// @access  Público
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ 'name.pt': 1 });
    
    res.json({
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao obter categorias'
      }
    });
  }
};

// @desc    Criar uma nova categoria
// @route   POST /api/categories
// @access  Privado/Admin
exports.createCategory = async (req, res) => {
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
    
    // Verificar se a categoria já existe
    const categoryExists = await Category.findOne({ categoryId: req.body.categoryId });
    if (categoryExists) {
      return res.status(409).json({
        error: {
          code: 'category_exists',
          message: 'Categoria com este ID já existe'
        }
      });
    }
    
    const category = new Category({
      categoryId: req.body.categoryId,
      name: {
        pt: req.body.name.pt,
        en: req.body.name.en
      }
    });
    
    const createdCategory = await category.save();
    
    res.status(201).json({
      id: createdCategory._id,
      message: 'Categoria criada com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao criar categoria'
      }
    });
  }
};

// @desc    Atualizar uma categoria
// @route   PUT /api/categories/:id
// @access  Privado/Admin
exports.updateCategory = async (req, res) => {
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
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Categoria não encontrada'
        }
      });
    }
    
    // Se o ID da categoria for alterado, verificar se já existe
    if (req.body.categoryId && req.body.categoryId !== category.categoryId) {
      const categoryExists = await Category.findOne({ categoryId: req.body.categoryId });
      if (categoryExists) {
        return res.status(409).json({
          error: {
            code: 'category_exists',
            message: 'Categoria com este ID já existe'
          }
        });
      }
      
      // Verificar se há vídeos usando esta categoria
      const videosUsingCategory = await Video.countDocuments({ category: category.categoryId });
      if (videosUsingCategory > 0) {
        // Atualizar todos os vídeos com o novo ID de categoria
        await Video.updateMany(
          { category: category.categoryId },
          { category: req.body.categoryId }
        );
      }
    }
    
    // Atualizar campos
    category.categoryId = req.body.categoryId || category.categoryId;
    
    if (req.body.name) {
      category.name.pt = req.body.name.pt || category.name.pt;
      category.name.en = req.body.name.en || category.name.en;
    }
    
    category.updatedAt = Date.now();
    
    const updatedCategory = await category.save();
    
    res.json({
      message: 'Categoria atualizada com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao atualizar categoria'
      }
    });
  }
};

// @desc    Excluir uma categoria
// @route   DELETE /api/categories/:id
// @access  Privado/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Categoria não encontrada'
        }
      });
    }
    
    // Verificar se há vídeos usando esta categoria
    const videosUsingCategory = await Video.countDocuments({ category: category.categoryId });
    if (videosUsingCategory > 0) {
      return res.status(400).json({
        error: {
          code: 'category_in_use',
          message: 'Não é possível excluir categoria em uso por vídeos',
          details: { count: videosUsingCategory }
        }
      });
    }
    
    await category.deleteOne();
    
    res.json({
      message: 'Categoria excluída com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao excluir categoria'
      }
    });
  }
};

// @desc    Obter vídeos de uma categoria específica
// @route   GET /api/categories/:id/videos
// @access  Público
exports.getCategoryVideos = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Categoria não encontrada'
        }
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Contar total de vídeos na categoria
    const total = await Video.countDocuments({ category: category.categoryId });
    
    // Ordenação
    let sort = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split('_');
      sort[field] = order === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 }; // Padrão: mais recentes primeiro
    }
    
    // Buscar vídeos
    const videos = await Video.find({ category: category.categoryId })
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
        message: 'Erro ao obter vídeos da categoria'
      }
    });
  }
};
