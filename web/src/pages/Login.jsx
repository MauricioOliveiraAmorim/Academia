import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { email, senha };
            const resposta = await api.post('/auth/login', payload);

            localStorage.setItem('userEmail', email);
            localStorage.setItem('userId', resposta.data.id);

            const tipoRetornado = resposta.data?.tipo;
            const tipoLower = typeof tipoRetornado === 'string' ? tipoRetornado.toLowerCase() : '';

            if (tipoLower === 'instrutor') {
                navigate('/instrutor');
            } else {
                localStorage.setItem('alunoId', resposta.data.id);
                navigate('/aluno');
            }
        } catch (error) {
            const msg = error.response?.data?.error || 'Verifique o servidor e as credenciais.';
            alert('Falha no Login: ' + msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Acessar o Sistema" subtitle="Entre para acompanhar seus treinos">
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@email.com"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                        id="senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                <p className="text-center text-sm text-gotham-300">
                    Não tem conta?{' '}
                    <Link to="/registro" className="font-semibold text-bat-yellow-500 hover:text-bat-yellow-400">
                        Cadastre-se
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}

export default Login;
