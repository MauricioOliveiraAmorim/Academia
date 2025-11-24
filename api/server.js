const express = require('express');
const cors = require('cors');
require('dotenv').config();

const alunoRoutes = require('./src/routes/alunoRoutes');
const instrutorRoutes = require('./src/routes/instrutorRoutes');
const frequenciaRoutes = require('./src/routes/frequenciaRoutes');
const exercicioRoutes = require('./src/routes/exercicioRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const planoTreinoRoutes = require('./src/routes/planoTreinoRoutes');
const planoExercicioRoutes = require('./src/routes/planoExercicioRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('✅ API da Academia rodando!');
});

app.use('/alunos', alunoRoutes);
app.use('/instrutores', instrutorRoutes);
app.use('/frequencias', frequenciaRoutes);
app.use('/exercicios', exercicioRoutes);
app.use('/auth', loginRoutes);
app.use('/planotreinos', planoTreinoRoutes);
app.use('/planoexercicios', planoExercicioRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});