const express = require('express');
const router = express.Router();
const instrutorController = require('../controllers/InstrutorController');
const { autenticar, autorizar } = require('../middlewares/authMiddleware');

router.post('/', autenticar, autorizar('Instrutor'), instrutorController.criar);
router.get('/', autenticar, instrutorController.listar);
router.delete('/:id', autenticar, autorizar('Instrutor'), instrutorController.deletar);

module.exports = router;