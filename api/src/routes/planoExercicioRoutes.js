const express = require('express');
const router = express.Router();
const planoExercicioController = require('../controllers/PlanoExercicioController');
const { autenticar, autorizar } = require('../middlewares/authMiddleware');

router.post('/', autenticar, autorizar('Instrutor'), planoExercicioController.criar);
router.get('/plano/:id_planotreino', autenticar, planoExercicioController.listarPorPlano);
router.delete('/:id', autenticar, autorizar('Instrutor'), planoExercicioController.deletar);

module.exports = router;
