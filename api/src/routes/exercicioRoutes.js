const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/ExercicioController');

router.post('/', exercicioController.criar);
router.get('/', exercicioController.listar);
router.delete('/:id', exercicioController.deletar);

module.exports = router;