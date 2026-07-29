const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/AlunoController');
const { autenticar, autorizar } = require('../middlewares/authMiddleware');

router.post('/', autenticar, autorizar('Instrutor'), alunoController.criar);
router.get('/', autenticar, autorizar('Instrutor'), alunoController.listar);
router.get('/:id', autenticar, alunoController.buscarPorId);
router.put('/:id', autenticar, alunoController.atualizar);
router.delete('/:id', autenticar, autorizar('Instrutor'), alunoController.deletar);

module.exports = router;