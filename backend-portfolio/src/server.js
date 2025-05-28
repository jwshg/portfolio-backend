require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Importar rotas
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const categoryRoutes = require('./routes/categories');
const contactRoutes = require('./routes/contact');
const configRoutes = require('./routes/config');

// Conectar à base de dados
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/config', configRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Portfólio de Vídeos funcionando!' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      code: 'server_error',
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'not_found',
      message: 'Recurso não encontrado'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
