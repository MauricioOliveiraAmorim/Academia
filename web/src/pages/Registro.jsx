import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; 
// Certifique-se de que o arquivo de service do backend está configurado!

function Registro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState(''); // NOVO CAMPO
    const [tipo, setTipo] = useState('Aluno'); // 'Aluno' ou 'Instrutor'
    const [cpf, setCpf] = useState('');
    const [especialidade, setEspecialidade] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    async function handleRegistro(e) {
        e.preventDefault();
        setError(''); // Limpa erros anteriores

        // 1. **Validação de Senhas no Frontend**
        if (senha !== confirmaSenha) {
            setError('A senha e a confirmação de senha não coincidem.');
            return;
        }

        // Validação do CPF quando o tipo for Aluno
        if (tipo === 'Aluno') {
            const apenasDigitos = cpf.replace(/\D/g, '');
            if (!/^\d{11}$/.test(apenasDigitos)) {
                setError('CPF inválido: deve conter exatamente 11 dígitos numéricos.');
                return;
            }
        }

        // 2. Coleta os dados básicos
        const dadosComuns = { nome, email, senha, tipo };
        let payload = {};

        // 3. Adiciona campos específicos ao payload
        if (tipo === 'Aluno') {
            payload = { ...dadosComuns, cpf }; 
        } else if (tipo === 'Instrutor') {
            payload = { ...dadosComuns, especialidade };
        } else {
            setError('Erro: Selecione o tipo de usuário.');
            return;
        }

        try {
            // Chama o novo endpoint /auth/registro
            const resposta = await api.post('/auth/registro', payload); 
            alert(`Usuário ${resposta.data.perfil.nome} (${tipo}) registrado com sucesso!`);
            navigate('/login');
        } catch (error) {
            console.error('Erro de Registro:', error);

            // O backend retorna { error: <mensagem> } e não sempre `message`, então checamos ambos
            const respData = error.response?.data || {};
            const msg = (respData.message || respData.error || error.message || 'Erro desconhecido no registro.').toString();

            // Normaliza para comparações
            const lower = msg.toLowerCase();

            // Detecta e-mail já existente (mensagens em PT-BR do backend contain 'e-mail' ou 'email' + 'já'/'registr')
            if ((lower.includes('e-mail') || lower.includes('email')) && (lower.includes('já') || lower.includes('ja') || lower.includes('registr'))) {
                setError('Falha no Registro: O e-mail já está sendo utilizado.');
                return;
            }

            // Detecta CPF já existente
            if (lower.includes('cpf') && (lower.includes('já') || lower.includes('ja') || lower.includes('associ'))) {
                setError('Falha no Registro: O CPF já está sendo utilizado.');
                return;
            }

            // Caso geral: mostra a mensagem retornada pelo backend
            setError('Falha no Registro: ' + msg);
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
            <h2>Novo Registro</h2>
            
            <form onSubmit={handleRegistro}>
                
                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

                {/* Seleção de Perfil */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Tipo de Perfil:</label><br/>
                    <select 
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="Aluno">Aluno</option>
                        <option value="Instrutor">Instrutor</option>
                    </select>
                </div>
                
                {/* Campos Comuns */}
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome Completo" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                
                {/* CAMPO NOVO */}
                <input 
                    type="password" 
                    value={confirmaSenha} 
                    onChange={(e) => setConfirmaSenha(e.target.value)} 
                    placeholder="Confirme a Senha" 
                    required 
                    style={{ width: '100%', padding: '8px', marginBottom: '15px', borderColor: senha !== confirmaSenha && confirmaSenha.length > 0 ? 'red' : '' }} 
                />

                {/* Campos Específicos do Aluno */}
                {tipo === 'Aluno' && (
                    <>
                        <input
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="CPF"
                            required
                            style={{
                                width: '100%',
                                padding: '8px',
                                marginBottom: '5px',
                                borderColor: cpf && !/^\d{11}$/.test(cpf.replace(/\D/g, '')) ? 'red' : ''
                            }}
                        />
                        {cpf && !/^\d{11}$/.test(cpf.replace(/\D/g, '')) && (
                            <div style={{ color: 'red', marginBottom: '10px', fontWeight: '500' }}>CPF inválido: insira 11 dígitos numéricos.</div>
                        )}
                        {/* Campo Data Matrícula REMOVIDO */}
                    </>
                )}

                {/* Campos Específicos do Instrutor */}
                {tipo === 'Instrutor' && (
                    <input type="text" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} placeholder="Especialidade" required style={{ width: '100%', padding: '8px', marginBottom: '15px' }} />
                )}

                <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>Registrar</button>
                <Link to="/login" style={{ marginLeft: '10px' }}>Já tenho conta</Link>
            </form>
        </div>
    );
}

export default Registro;