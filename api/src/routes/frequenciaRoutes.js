const express = require('express');
const router = express.Router();
const frequenciaController = require('../controllers/FrequenciaController');
const { autenticar, autorizar } = require('../middlewares/authMiddleware');

router.post('/', autenticar, frequenciaController.criar);
router.patch('/:id', autenticar, frequenciaController.atualizar);
router.get('/', autenticar, frequenciaController.listar);
router.delete('/:id', autenticar, autorizar('Instrutor'), frequenciaController.deletar);

module.exports = router;