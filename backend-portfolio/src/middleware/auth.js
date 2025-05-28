const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rotas
exports.protect = async (req, res, next) => {
  let token;

  // Verificar se o token existe no cabeçalho Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obter utilizador do token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        error: {
          code: 'unauthorized',
          message: 'Não autorizado, token inválido'
        }
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'unauthorized',
        message: 'Não autorizado, token não fornecido'
      }
    });
  }
};

// Middleware para verificar se o utilizador é admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      error: {
        code: 'forbidden',
        message: 'Não autorizado, acesso apenas para administradores'
      }
    });
  }
};

// Gerar token JWT
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
