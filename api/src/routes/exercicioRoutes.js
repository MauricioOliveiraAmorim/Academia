const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/ExercicioController');
const { autenticar, autorizar } = require('../middlewares/authMiddleware');

router.post('/', autenticar, autorizar('Instrutor'), exercicioController.criar);
router.get('/', autenticar, exercicioController.listar);
router.delete('/:id', autenticar, autorizar('Instrutor'), exercicioController.deletar);

module.exports = router;