import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExercicioService from '../services/ExercicioService';
import AlunoService from '../services/AlunoService';
import FrequenciaService from '../services/FrequenciaService';

// Componente Tabela de Painel (Estilo Escuro/Sombrio)
const DashboardTable = ({ title, columns, data, hasActionButton, actionHandler, actionLabel = 'Ação' }) => (
    <div className="dashboard-table-container">
        <h3 className="dashboard-table-title">{title}</h3>

        <table className="dashboard-table">
            <thead>
                <tr>
                    {columns.map(col => (
                        <th key={col.key} className="dashboard-table-th">{col.header}</th>
                    ))}
                    {hasActionButton && <th className="dashboard-table-th" style={{ textAlign: 'center' }}>Ação</th>}
                </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map((item, index) => (
                        <tr key={index} className="dashboard-table-row">
                            {columns.map(col => (
                                <td key={col.key} className="dashboard-table-td">{item[col.key]}</td>
                            ))}
                            {hasActionButton && (
                                <td className="dashboard-table-td" style={{ textAlign: 'center' }}>
                                    <button onClick={() => actionHandler(item.id)} className="action-btn">{actionLabel}</button>
                                </td>
                            )}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length + (hasActionButton ? 1 : 0)} className="dashboard-empty">
                            Nenhum dado carregado.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

const InstrutorDashboard = () => {
    const navigate = useNavigate();

    // --- Estados para Armazenar Dados (VAZIOS) ---
    const [alunosData, setAlunosData] = useState([]);
    const [exerciciosData, setExerciciosData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [novoExercicio, setNovoExercicio] = useState({ nome: '', grupomuscular: '', equipamento: '', descricao: '', url_video: '' });

    // Estado para Frequência
    const [isFrequenciaModalOpen, setIsFrequenciaModalOpen] = useState(false);
    const [novaFrequencia, setNovaFrequencia] = useState({ id_aluno: '', dia: '', presenca: 'Presente' });

    useEffect(() => {
        // Buscar alunos e exercícios do backend
        async function fetchData() {
            try {
                const [alunosResp, exerciciosResp] = await Promise.all([
                    AlunoService.listar(),
                    ExercicioService.listar()
                ]);

                setAlunosData((alunosResp?.data || []).map(a => ({ 
                    nome_aluno: a.nome, 
                    nome_plano: (a.planotreino && a.planotreino.length > 0) ? 'Ativo' : 'Inativo', 
                    id: a.id_aluno 
                })));
                setExerciciosData((exerciciosResp?.data || []).map(e => ({ 
                    nome: e.nome, 
                    grupomuscular: e.grupomuscular, 
                    equipamento: e.equipamento, 
                    id: e.id_exercicio,
                    link_midia: e.url_video ? <a href={e.url_video} target="_blank" rel="noopener noreferrer" style={{color: '#4CAF50'}}>Ver Mídia</a> : '-'
                })));
            } catch (err) {
                console.error('Erro ao buscar dados do dashboard:', err);
            }
        }

        fetchData();
    }, []);
    // ---------------------------------

    function handleLogout() {
        navigate('/login');
    }
    
    const handleViewAluno = (alunoId) => {
        navigate(`/alunos/${alunoId}`);
    };

    const handleAddExercicio = () => {
        setNovoExercicio({ nome: '', grupomuscular: '', equipamento: '', descricao: '', url_video: '' });
        setIsModalOpen(true);
    };

    const handleCreateExercicio = async () => {
        try {
            await ExercicioService.criar(novoExercicio);
            // Recarrega a lista de exercícios
            const resp = await ExercicioService.listar();
            setExerciciosData((resp?.data || []).map(e => ({ 
                nome: e.nome, 
                grupomuscular: e.grupomuscular, 
                equipamento: e.equipamento, 
                id: e.id_exercicio,
                link_midia: e.url_video ? <a href={e.url_video} target="_blank" rel="noopener noreferrer" style={{color: '#4CAF50'}}>Ver Mídia</a> : '-'
            })));
            setIsModalOpen(false);
            alert('Exercício criado com sucesso.');
        } catch (err) {
            console.error('Erro ao criar exercício:', err);
            alert('Falha ao criar exercício. Veja o console para detalhes.');
        }
    };

    const handleDeleteExercicio = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este exercício?")) return;

        try {
            await ExercicioService.deletar(id);
            setExerciciosData(prev => prev.filter(x => x.id !== id));
        } catch (err) {
            console.error('Erro ao deletar exercício:', err);
            // Exibe a mensagem de erro vinda do backend (ex: vinculado a plano)
            const mensagemErro = err.response?.data?.error || 'Falha ao deletar exercício.';
            alert(mensagemErro);
        }
    };

    // Handlers de Frequência
    const handleOpenFrequenciaModal = () => {
        setNovaFrequencia({ id_aluno: '', dia: new Date().toISOString().split('T')[0], presenca: 'Presente' });
        setIsFrequenciaModalOpen(true);
    };

    const handleCreateFrequencia = async () => {
        try {
            if (!novaFrequencia.id_aluno) {
                alert('Selecione um aluno.');
                return;
            }
            await FrequenciaService.criar(novaFrequencia);
            setIsFrequenciaModalOpen(false);
            alert('Frequência registrada com sucesso!');
        } catch (err) {
            console.error('Erro ao registrar frequência:', err);
            alert('Falha ao registrar frequência.');
        }
    };

    // Definição das colunas
    const alunoColumns = [
        { key: 'nome_aluno', header: 'Nome do Aluno' },
        { key: 'nome_plano', header: 'Plano de Treino' },
    ];

    const exercicioColumns = [
        { key: 'nome', header: 'Nome do Exercício' },
        { key: 'grupomuscular', header: 'Grupo Muscular' },
        { key: 'equipamento', header: 'Equipamento' },
        { key: 'link_midia', header: 'Mídia' },
    ];

    return (
        <div className="instrutor-dashboard-dark">

            {/* Top bar */}
            <header className="instrutor-topbar-dark">
                <div className="instrutor-brand-dark">Academia | Painel Instrutor</div>

                <nav>
                    <div className="topbar-center-dark">Visão Geral</div>
                </nav>

                <div>
                    <button onClick={handleLogout} className="logout-btn-dark">Logout</button>
                </div>
            </header>

            {/* Conteúdo principal */}
            <main className="dashboard-main-dark">
                <div className="dashboard-wrapper">

                    {/* Botões de Ação */}
                    <div className="add-exercicio-row" style={{ gap: '10px', display: 'flex' }}>
                        <button onClick={handleAddExercicio} className="add-exercicio-btn">+ Adicionar Novo Exercício</button>
                        <button onClick={handleOpenFrequenciaModal} className="add-exercicio-btn" style={{ backgroundColor: '#4CAF50' }}>+ Marcar Frequência</button>
                    </div>

                    {/* Tabelas Lado a Lado */}
                    <div className="tables-container">
                        {/* Tabela de Alunos */}
                        <DashboardTable
                            title="Alunos e Planos Ativos"
                            columns={alunoColumns}
                            data={alunosData}
                            hasActionButton={true}
                            actionHandler={handleViewAluno}
                            actionLabel={'Ver/Editar'}
                        />

                        {/* Tabela de Exercícios */}
                        <DashboardTable
                            title="Biblioteca de Exercícios"
                            columns={exercicioColumns}
                            data={exerciciosData}
                            hasActionButton={true}
                            actionHandler={(id) => handleDeleteExercicio(id)}
                            actionLabel={'Deletar'}
                        />
                    </div>
                </div>
            </main>

            {/* Modal de Criação de Exercício */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <h3>Novo Exercício</h3>

                        <div className="form-row">
                            <label>Nome</label>
                            <input value={novoExercicio.nome} onChange={(e) => setNovoExercicio(prev => ({ ...prev, nome: e.target.value }))} />
                        </div>

                        <div className="form-row">
                            <label>Grupo Muscular</label>
                            <input value={novoExercicio.grupomuscular} onChange={(e) => setNovoExercicio(prev => ({ ...prev, grupomuscular: e.target.value }))} />
                        </div>

                        <div className="form-row">
                            <label>Equipamento</label>
                            <input value={novoExercicio.equipamento} onChange={(e) => setNovoExercicio(prev => ({ ...prev, equipamento: e.target.value }))} />
                        </div>

                        <div className="form-row">
                            <label>Descrição</label>
                            <textarea rows={4} value={novoExercicio.descricao} onChange={(e) => setNovoExercicio(prev => ({ ...prev, descricao: e.target.value }))} />
                        </div>

                        <div className="form-row">
                            <label>URL do Vídeo/Imagem</label>
                            <input 
                                type="text" 
                                placeholder="https://youtube.com/..." 
                                value={novoExercicio.url_video} 
                                onChange={(e) => setNovoExercicio(prev => ({ ...prev, url_video: e.target.value }))} 
                            />
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setIsModalOpen(false)} style={{ background: '#ddd', color: '#000' }}>Cancelar</button>
                            <button onClick={handleCreateExercicio}>Criar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Frequência */}
            {isFrequenciaModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <h3>Registrar Frequência</h3>

                        <div className="form-row">
                            <label>Aluno</label>
                            <select 
                                value={novaFrequencia.id_aluno} 
                                onChange={(e) => setNovaFrequencia(prev => ({ ...prev, id_aluno: e.target.value }))}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                            >
                                <option value="">Selecione um aluno...</option>
                                {alunosData.map(aluno => (
                                    <option key={aluno.id_aluno} value={aluno.id_aluno}>
                                        {aluno.nome_aluno}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <label>Data</label>
                            <input 
                                type="date" 
                                value={novaFrequencia.dia} 
                                onChange={(e) => setNovaFrequencia(prev => ({ ...prev, dia: e.target.value }))} 
                            />
                        </div>

                        <div className="form-row">
                            <label>Status</label>
                            <select 
                                value={novaFrequencia.presenca} 
                                onChange={(e) => setNovaFrequencia(prev => ({ ...prev, presenca: e.target.value }))}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                            >
                                <option value="Presente">Presente</option>
                                <option value="Falta">Falta</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setIsFrequenciaModalOpen(false)} style={{ background: '#ddd', color: '#000' }}>Cancelar</button>
                            <button onClick={handleCreateFrequencia}>Registrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstrutorDashboard;