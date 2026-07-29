const express = require('express');
const router = express.Router();
const planoTreinoController = require('../controllers/PlanoTreinoController');
const { autenticar, autorizar } = require('../middlewares/authMiddleware');

router.post('/', autenticar, autorizar('Instrutor'), planoTreinoController.criar);
router.get('/', autenticar, planoTreinoController.listar);
router.get('/:id', autenticar, planoTreinoController.buscar);
router.delete('/:id', autenticar, autorizar('Instrutor'), planoTreinoController.deletar);

module.exports = router;
