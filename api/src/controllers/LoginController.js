const loginService = require('../services/LoginService');

class LoginController {
    async registrar(req, res) {
        try {
            const resultado = await loginService.registrarNovoUsuario(req.body);
            // Retorna o novo usuário e o registro de login criado
            return res.status(201).json(resultado); 
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) { // <--- FUNÇÃO NOVA
        try {
            const { email, senha } = req.body;
            const resultado = await loginService.autenticar(email, senha);
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(401).json({ error: error.message }); // 401: Unauthorized
        }
    }
}

module.exports = new LoginController();