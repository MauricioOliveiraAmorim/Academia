import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; 

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        try {
            const payload = { email, senha };
            const resposta = await api.post('/auth/login', payload); 
            
            alert(`Bem-vindo, ${resposta.data.tipo}! ID: ${resposta.data.id}`);
            
            // Redireciona para a tela principal (Alunos ou Dashboard) com base no tipo retornado
            const tipoRetornado = resposta.data?.tipo;
            const tipoLower = typeof tipoRetornado === 'string' ? tipoRetornado.toLowerCase() : '';

            if (tipoLower === 'instrutor') {
                navigate('/instrutor');
            } else {
                navigate('/alunos');
            }
        } catch (error) {
            const msg = error.response?.data?.error || 'Verifique o servidor e as credenciais.';
            alert('Falha no Login: ' + msg);
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Acessar o Sistema</h2>
            
            <form onSubmit={handleLogin}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#b0b0b020', border: '1px solid #b8860b' }} />
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" required style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#b0b0b020', border: '1px solid #b8860b' }} />
                
                <button type="submit" style={{ width: '100%', padding: '12px', cursor: 'pointer', backgroundColor: '#b8860b', color: '#0a0a0a', border: 'none' }}>
                    Entrar
                </button>
                
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#b0b0b0' }}>
                    Não tem conta? <Link to="/registro" style={{ color: '#b8860b' }}>Cadastre-se</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;