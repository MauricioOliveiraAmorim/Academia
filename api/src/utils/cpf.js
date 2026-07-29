// Remove caracteres não-dígitos e valida se o CPF tem 11 dígitos.
// Não valida os dígitos verificadores (checksum) - apenas formato.
function cleanAndValidateCpf(cpf) {
    if (!cpf) return null;

    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
        throw new Error("Formato de CPF inválido. O CPF deve conter 11 dígitos.");
    }

    return cleanCpf;
}

module.exports = { cleanAndValidateCpf };
