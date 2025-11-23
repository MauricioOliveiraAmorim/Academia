const express = require('express');
const router = express.Router();
const frequenciaController = require('../controllers/FrequenciaController');

router.post('/', frequenciaController.criar);
router.get('/', frequenciaController.listar);
router.delete('/:id', frequenciaController.deletar);

module.exports = router;