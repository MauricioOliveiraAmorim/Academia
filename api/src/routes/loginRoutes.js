const express = require('express');
const router = express.Router();
const loginController = require('../controllers/LoginController');

// Rota para REGISTRO
router.post('/registro', loginController.registrar);

router.post('/login', loginController.login); // <--- ROTA NOVA

module.exports = router;