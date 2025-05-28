const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Autenticar utilizador e gerar token
// @route   POST /api/auth/login
// @access  Público
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se email e password foram fornecidos
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Por favor, forneça email e senha'
        }
      });
    }

    // Verificar se o utilizador existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'invalid_credentials',
          message: 'Credenciais inválidas'
        }
      });
    }

    // Verificar se a senha está correta
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'invalid_credentials',
          message: 'Credenciais inválidas'
        }
      });
    }

    // Atualizar último login
    user.lastLogin = Date.now();
    await user.save();

    // Retornar token e dados do utilizador
    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro no servidor'
      }
    });
  }
};

// @desc    Registar um novo utilizador (apenas para setup inicial)
// @route   POST /api/auth/register
// @access  Público (deve ser restrito após setup inicial)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o utilizador já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        error: {
          code: 'user_exists',
          message: 'Utilizador já existe'
        }
      });
    }

    // Criar novo utilizador
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin' // Por padrão, todos os utilizadores são admin neste sistema
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(400).json({
        error: {
          code: 'invalid_data',
          message: 'Dados de utilizador inválidos'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro no servidor'
      }
    });
  }
};

// @desc    Obter perfil do utilizador
// @route   GET /api/auth/profile
// @access  Privado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      });
    } else {
      res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Utilizador não encontrado'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro no servidor'
      }
    });
  }
};

// @desc    Atualizar perfil do utilizador
// @route   PUT /api/auth/profile
// @access  Privado
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Utilizador não encontrado'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro no servidor'
      }
    });
  }
};

// @desc    Solicitar redefinição de senha
// @route   POST /api/auth/reset-password
// @access  Público
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se o utilizador existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Utilizador não encontrado'
        }
      });
    }

    // Aqui seria implementado o envio de email com link para redefinição de senha
    // Por simplicidade, apenas retornamos uma mensagem de sucesso

    res.json({
      message: 'Email de redefinição de senha enviado'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Erro no servidor'
      }
    });
  }
};
