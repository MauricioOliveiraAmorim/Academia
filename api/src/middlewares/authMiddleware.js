const jwt = require('jsonwebtoken');

// Verifica o header "Authorization: Bearer <token>" e anexa o usuário decodificado em req.user
function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    const token = authHeader.slice('Bearer '.length);

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}

// Fábrica de middleware: restringe a rota a um ou mais tipos de usuário (ex: autorizar('Instrutor'))
function autorizar(...tiposPermitidos) {
    return (req, res, next) => {
        if (!req.user || !tiposPermitidos.includes(req.user.tipo)) {
            return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso.' });
        }
        return next();
    };
}

module.exports = { autenticar, autorizar };
