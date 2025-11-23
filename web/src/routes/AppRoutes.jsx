import { Routes, Route } from 'react-router-dom';
import Registro from '../pages/Registro';
import Login from '../pages/Login';
import InstrutorDashboard from '../pages/InstrutorDashboard';
import AlunoDetalhes from '../pages/AlunoDetalhes';
import AlunoDashboard from '../pages/AlunoDashboard';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} /> // Deixando o Login como tela inicial
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<Login />} /> 
            <Route path="/instrutor" element={<InstrutorDashboard />} />
            <Route path="/aluno" element={<AlunoDashboard />} />
            <Route path="/alunos/:id" element={<AlunoDetalhes />} />
            
        </Routes>
    );
};

export default AppRoutes;