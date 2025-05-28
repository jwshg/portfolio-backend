const Contact = require('../models/Contact');
const SiteConfig = require('../models/SiteConfig');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// @desc    Enviar mensagem de contacto
// @route   POST /api/contact
// @access  Público
exports.sendContactMessage = async (req, res) => {
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
    
    const { name, email, message } = req.body;
    
    // Criar nova mensagem de contacto
    const contact = new Contact({
      name,
      email,
      message
    });
    
    const savedContact = await contact.save();
    
    // Obter configuração do site para email de contacto
    const siteConfig = await SiteConfig.findOne();
    const contactEmail = siteConfig ? siteConfig.contactEmail : process.env.DEFAULT_CONTACT_EMAIL;
    
    // Enviar email (em produção)
    if (process.env.NODE_ENV === 'production') {
      try {
        // Configurar transporte de email
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        
        // Enviar email
        await transporter.sendMail({
          from: `"Portfólio de Vídeos" <${process.env.SMTP_USER}>`,
          to: contactEmail,
          subject: `Nova mensagem de contacto de ${name}`,
          text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
          html: `<p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mensagem:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>`
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não retornamos erro ao cliente, pois a mensagem foi salva no banco de dados
      }
    }
    
    res.status(201).json({
      message: 'Mensagem enviada com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao enviar mensagem'
      }
    });
  }
};

// @desc    Obter todas as mensagens de contacto
// @route   GET /api/contact/messages
// @access  Privado/Admin
exports.getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtrar por status de leitura
    let query = {};
    if (req.query.read === 'true') {
      query.read = true;
    } else if (req.query.read === 'false') {
      query.read = false;
    }
    
    // Contar total de mensagens
    const total = await Contact.countDocuments(query);
    
    // Buscar mensagens
    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calcular páginas
    const pages = Math.ceil(total / limit);
    
    res.json({
      messages,
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
        message: 'Erro ao obter mensagens'
      }
    });
  }
};

// @desc    Atualizar status de leitura de uma mensagem
// @route   PUT /api/contact/messages/:id
// @access  Privado/Admin
exports.updateMessageStatus = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Mensagem não encontrada'
        }
      });
    }
    
    message.read = req.body.read !== undefined ? req.body.read : message.read;
    
    await message.save();
    
    res.json({
      message: 'Status da mensagem atualizado'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao atualizar status da mensagem'
      }
    });
  }
};

// @desc    Excluir uma mensagem de contacto
// @route   DELETE /api/contact/messages/:id
// @access  Privado/Admin
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Mensagem não encontrada'
        }
      });
    }
    
    await message.deleteOne();
    
    res.json({
      message: 'Mensagem excluída com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro ao excluir mensagem'
      }
    });
  }
};
