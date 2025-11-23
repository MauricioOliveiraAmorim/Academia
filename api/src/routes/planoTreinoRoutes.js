const express = require('express');
const router = express.Router();
const planoTreinoController = require('../controllers/PlanoTreinoController');

router.post('/', planoTreinoController.criar);
router.get('/', planoTreinoController.listar);
router.get('/:id', planoTreinoController.buscar);
router.delete('/:id', planoTreinoController.deletar);

module.exports = router;
