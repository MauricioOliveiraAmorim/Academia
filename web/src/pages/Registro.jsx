import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/ui/Button';
import { Input, Select, Label } from '../components/ui/Input';

function Registro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [tipo, setTipo] = useState('Aluno');
    const [cpf, setCpf] = useState('');
    const [especialidade, setEspecialidade] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const cpfInvalido = tipo === 'Aluno' && cpf.length > 0 && !/^\d{11}$/.test(cpf.replace(/\D/g, ''));
    const senhasDivergem = confirmaSenha.length > 0 && senha !== confirmaSenha;

    async function handleRegistro(e) {
        e.preventDefault();
        setError('');

        if (senha !== confirmaSenha) {
            setError('A senha e a confirmação de senha não coincidem.');
            return;
        }

        if (tipo === 'Aluno') {
            const apenasDigitos = cpf.replace(/\D/g, '');
            if (!/^\d{11}$/.test(apenasDigitos)) {
                setError('CPF inválido: deve conter exatamente 11 dígitos numéricos.');
                return;
            }
        }

        const dadosComuns = { nome, email, senha, tipo };
        let payload = {};

        if (tipo === 'Aluno') {
            payload = { ...dadosComuns, cpf };
        } else if (tipo === 'Instrutor') {
            payload = { ...dadosComuns, especialidade };
        } else {
            setError('Erro: Selecione o tipo de usuário.');
            return;
        }

        setLoading(true);
        try {
            const resposta = await api.post('/auth/registro', payload);
            const { novoLogin, token } = resposta.data;

            localStorage.setItem('userEmail', novoLogin.email);
            localStorage.setItem('userId', novoLogin.referencia);
            localStorage.setItem('userTipo', novoLogin.tipousuario);
            localStorage.setItem('token', token);

            if (novoLogin.tipousuario === 'Instrutor') {
                navigate('/instrutor');
            } else {
                localStorage.setItem('alunoId', novoLogin.referencia);
                navigate('/aluno');
            }
        } catch (error) {
            console.error('Erro de Registro:', error);

            const respData = error.response?.data || {};
            const msg = (respData.message || respData.error || error.message || 'Erro desconhecido no registro.').toString();
            const lower = msg.toLowerCase();

            if ((lower.includes('e-mail') || lower.includes('email')) && (lower.includes('já') || lower.includes('ja') || lower.includes('registr'))) {
                setError('Falha no Registro: O e-mail já está sendo utilizado.');
            } else if (lower.includes('cpf') && (lower.includes('já') || lower.includes('ja') || lower.includes('associ'))) {
                setError('Falha no Registro: O CPF já está sendo utilizado.');
            } else {
                setError('Falha no Registro: ' + msg);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Novo Registro" subtitle="Crie sua conta para começar">
            <form onSubmit={handleRegistro} className="space-y-4">
                {error && (
                    <p className="rounded-lg border border-bat-red-600/50 bg-bat-red-500/10 px-3 py-2 text-sm font-medium text-bat-red-500">
                        {error}
                    </p>
                )}

                <div>
                    <Label htmlFor="tipo">Tipo de Perfil</Label>
                    <Select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                        <option value="Aluno">Aluno</option>
                        <option value="Instrutor">Instrutor</option>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" required />
                </div>

                <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required />
                </div>

                <div>
                    <Label htmlFor="senha">Senha</Label>
                    <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" required />
                </div>

                <div>
                    <Label htmlFor="confirmaSenha">Confirme a Senha</Label>
                    <Input
                        id="confirmaSenha"
                        type="password"
                        value={confirmaSenha}
                        onChange={(e) => setConfirmaSenha(e.target.value)}
                        placeholder="••••••••"
                        required
                        invalid={senhasDivergem}
                    />
                </div>

                {tipo === 'Aluno' && (
                    <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                            id="cpf"
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="Somente números"
                            required
                            invalid={cpfInvalido}
                        />
                        {cpfInvalido && (
                            <p className="mt-1.5 text-sm font-medium text-bat-red-500">CPF inválido: insira 11 dígitos numéricos.</p>
                        )}
                    </div>
                )}

                {tipo === 'Instrutor' && (
                    <div>
                        <Label htmlFor="especialidade">Especialidade</Label>
                        <Input
                            id="especialidade"
                            type="text"
                            value={especialidade}
                            onChange={(e) => setEspecialidade(e.target.value)}
                            placeholder="Ex: Musculação, Funcional..."
                            required
                        />
                    </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar'}
                </Button>

                <p className="text-center text-sm text-gotham-300">
                    Já tem conta?{' '}
                    <Link to="/login" className="font-semibold text-bat-yellow-500 hover:text-bat-yellow-400">
                        Entrar
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}

export default Registro;
