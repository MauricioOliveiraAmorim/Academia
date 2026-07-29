import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExercicioService from '../services/ExercicioService';
import AlunoService from '../services/AlunoService';
import FrequenciaService from '../services/FrequenciaService';
import Topbar from '../components/ui/Topbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select, Label } from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const mapExercicio = (e) => ({
    nome: e.nome,
    grupomuscular: e.grupomuscular,
    equipamento: e.equipamento,
    id: e.id_exercicio,
    link_midia: e.url_video ? <a href={e.url_video} target="_blank" rel="noopener noreferrer" className="font-semibold text-bat-green-500 hover:text-bat-green-600">Ver Mídia</a> : '-'
});

const DashboardTable = ({ title, columns, data, hasActionButton, actionHandler, actionLabel = 'Ação', actionVariant = 'ghost' }) => (
    <Card className="flex-1 min-w-0 p-5">
        <h3 className="mb-4 border-b border-gotham-700 pb-3 font-display text-xl tracking-wide text-bat-yellow-500">{title}</h3>

        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gotham-700/60">
                        {columns.map(col => (
                            <th key={col.key} className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-bat-yellow-500">{col.header}</th>
                        ))}
                        {hasActionButton && <th className="px-3 py-2.5 text-center font-semibold text-bat-yellow-500">Ação</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={index} className="border-b border-gotham-700/60 transition-colors hover:bg-gotham-700/30">
                                {columns.map(col => (
                                    <td key={col.key} className="px-3 py-2.5 text-gotham-100">{item[col.key]}</td>
                                ))}
                                {hasActionButton && (
                                    <td className="px-3 py-2.5 text-center">
                                        <Button size="sm" variant={actionVariant} onClick={() => actionHandler(item.id)}>{actionLabel}</Button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (hasActionButton ? 1 : 0)} className="px-3 py-6 text-center italic text-gotham-300">
                                Nenhum dado carregado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </Card>
);

const InstrutorDashboard = () => {
    const navigate = useNavigate();

    const [alunosData, setAlunosData] = useState([]);
    const [exerciciosData, setExerciciosData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [novoExercicio, setNovoExercicio] = useState({ nome: '', grupomuscular: '', equipamento: '', descricao: '', url_video: '' });

    const [isFrequenciaModalOpen, setIsFrequenciaModalOpen] = useState(false);
    const [novaFrequencia, setNovaFrequencia] = useState({ id_aluno: '', dia: '', presenca: 'Presente' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tipo = localStorage.getItem('userTipo');
        if (!token || tipo !== 'Instrutor') {
            navigate('/login');
            return;
        }

        async function fetchData() {
            try {
                const [alunosResp, exerciciosResp] = await Promise.all([
                    AlunoService.listar(),
                    ExercicioService.listar()
                ]);

                setAlunosData((alunosResp?.data || []).map(a => ({
                    nome_aluno: a.nome,
                    nome_plano: (a.planotreino && a.planotreino.length > 0)
                        ? <Badge tone="success">Ativo</Badge>
                        : <Badge tone="neutral">Inativo</Badge>,
                    id: a.id_aluno
                })));
                setExerciciosData((exerciciosResp?.data || []).map(mapExercicio));
            } catch (err) {
                console.error('Erro ao buscar dados do dashboard:', err);
            }
        }

        fetchData();
    }, []);

    function handleLogout() {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userTipo');
        localStorage.removeItem('token');
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
            const resp = await ExercicioService.listar();
            setExerciciosData((resp?.data || []).map(mapExercicio));
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
            const mensagemErro = err.response?.data?.error || 'Falha ao deletar exercício.';
            alert(mensagemErro);
        }
    };

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
        <div className="min-h-screen bg-gotham-950">
            <Topbar
                title="Academia"
                subtitle="Painel do Instrutor"
                right={<Button variant="secondary" size="sm" onClick={handleLogout}>Sair</Button>}
            />

            <main className="mx-auto max-w-[1400px] px-6 py-8">
                <div className="mb-6 flex flex-wrap justify-end gap-3">
                    <Button onClick={handleAddExercicio}>+ Adicionar Exercício</Button>
                    <Button variant="success" onClick={handleOpenFrequenciaModal}>+ Marcar Frequência</Button>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <DashboardTable
                        title="Alunos e Planos Ativos"
                        columns={alunoColumns}
                        data={alunosData}
                        hasActionButton={true}
                        actionHandler={handleViewAluno}
                        actionLabel="Ver/Editar"
                    />

                    <DashboardTable
                        title="Biblioteca de Exercícios"
                        columns={exercicioColumns}
                        data={exerciciosData}
                        hasActionButton={true}
                        actionHandler={(id) => handleDeleteExercicio(id)}
                        actionLabel="Deletar"
                        actionVariant="danger"
                    />
                </div>
            </main>

            {isModalOpen && (
                <Modal
                    title="Novo Exercício"
                    onClose={() => setIsModalOpen(false)}
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreateExercicio}>Criar</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div>
                            <Label>Nome</Label>
                            <Input value={novoExercicio.nome} onChange={(e) => setNovoExercicio(prev => ({ ...prev, nome: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Grupo Muscular</Label>
                            <Input value={novoExercicio.grupomuscular} onChange={(e) => setNovoExercicio(prev => ({ ...prev, grupomuscular: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Equipamento</Label>
                            <Input value={novoExercicio.equipamento} onChange={(e) => setNovoExercicio(prev => ({ ...prev, equipamento: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Descrição</Label>
                            <Textarea rows={4} value={novoExercicio.descricao} onChange={(e) => setNovoExercicio(prev => ({ ...prev, descricao: e.target.value }))} />
                        </div>
                        <div>
                            <Label>URL do Vídeo/Imagem</Label>
                            <Input
                                type="text"
                                placeholder="https://youtube.com/..."
                                value={novoExercicio.url_video}
                                onChange={(e) => setNovoExercicio(prev => ({ ...prev, url_video: e.target.value }))}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {isFrequenciaModalOpen && (
                <Modal
                    title="Registrar Frequência"
                    onClose={() => setIsFrequenciaModalOpen(false)}
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setIsFrequenciaModalOpen(false)}>Cancelar</Button>
                            <Button variant="success" onClick={handleCreateFrequencia}>Registrar</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div>
                            <Label>Aluno</Label>
                            <Select
                                value={novaFrequencia.id_aluno}
                                onChange={(e) => setNovaFrequencia(prev => ({ ...prev, id_aluno: e.target.value }))}
                            >
                                <option value="">Selecione um aluno...</option>
                                {alunosData.map(aluno => (
                                    <option key={aluno.id} value={aluno.id}>
                                        {aluno.nome_aluno}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Label>Data</Label>
                            <Input
                                type="date"
                                value={novaFrequencia.dia}
                                onChange={(e) => setNovaFrequencia(prev => ({ ...prev, dia: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Select
                                value={novaFrequencia.presenca}
                                onChange={(e) => setNovaFrequencia(prev => ({ ...prev, presenca: e.target.value }))}
                            >
                                <option value="Presente">Presente</option>
                                <option value="Falta">Falta</option>
                            </Select>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default InstrutorDashboard;
