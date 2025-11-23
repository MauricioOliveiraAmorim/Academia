const express = require('express');
const router = express.Router();
const planoExercicioController = require('../controllers/PlanoExercicioController');

router.post('/', planoExercicioController.criar);
router.get('/plano/:id_planotreino', planoExercicioController.listarPorPlano);
router.delete('/:id', planoExercicioController.deletar);

module.exports = router;
