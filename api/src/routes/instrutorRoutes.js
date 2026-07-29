const express = require('express');
const router = express.Router();
const instrutorController = require('../controllers/InstrutorController');

router.post('/', instrutorController.criar);
router.get('/', instrutorController.listar);
router.delete('/:id', instrutorController.deletar);

module.exports = router;