// Traduz códigos de erro conhecidos do Prisma para respostas HTTP consistentes.
// https://www.prisma.io/docs/orm/reference/error-reference
function prismaErrorResponse(res, error, fallbackMessage, fallbackStatus = 500) {
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Registro não encontrado.' });
    }
    if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Já existe um registro com esse valor único.' });
    }
    if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Operação inválida: existe um registro relacionado que impede essa ação.' });
    }
    return res.status(fallbackStatus).json({ error: fallbackMessage });
}

module.exports = { prismaErrorResponse };
