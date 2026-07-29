const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const alunoRoutes = require('./src/routes/alunoRoutes');
const instrutorRoutes = require('./src/routes/instrutorRoutes');
const frequenciaRoutes = require('./src/routes/frequenciaRoutes');
const exercicioRoutes = require('./src/routes/exercicioRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const planoTreinoRoutes = require('./src/routes/planoTreinoRoutes');
const planoExercicioRoutes = require('./src/routes/planoExercicioRoutes');

const app = express();

// Em produção, restringe a origens explícitas via FRONTEND_URL (uma ou mais, separadas por vírgula).
// Sem a variável definida, libera qualquer origem — cenário de dev local.
const allowedOrigins = process.env.FRONTEND_URL?.split(',').map((url) => url.trim());
app.use(
    cors(
        allowedOrigins
            ? { origin: allowedOrigins }
            : undefined
    )
);
app.use(helmet());
app.use(express.json());

// Limita tentativas de login/registro para dificultar força bruta de credenciais.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

app.get('/', (req, res) => {
    res.send('✅ API da Academia rodando!');
});

app.use('/alunos', alunoRoutes);
app.use('/instrutores', instrutorRoutes);
app.use('/frequencias', frequenciaRoutes);
app.use('/exercicios', exercicioRoutes);
app.use('/auth', authLimiter, loginRoutes);
app.use('/planotreinos', planoTreinoRoutes);
app.use('/planoexercicios', planoExercicioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});