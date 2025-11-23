import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlunoService from '../services/AlunoService';
import FrequenciaService from '../services/FrequenciaService';
import PlanoTreinoService from '../services/PlanoTreinoService';
import PlanoExercicioService from '../services/PlanoExercicioService';

// Função auxiliar para formatar descanso
const formatarDescanso = (descanso) => {
    if (!descanso) return '—';
    try {
        // Descanso vem como string ISO (ex: "1970-01-01T00:01:00.000Z")
        const d = new Date(descanso);
        const h = String(d.getUTCHours()).padStart(2, '0');
        const m = String(d.getUTCMinutes()).padStart(2, '0');
        const s = String(d.getUTCSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    } catch {
        return '—';
    }
};

const AlunoDashboard = () => {
    const navigate = useNavigate();
    const [aluno, setAluno] = useState(null);
    const [planos, setPlanos] = useState([]);
    const [selectedPlano, setSelectedPlano] = useState(null);
    const [exerciciosPlano, setExerciciosPlano] = useState([]);
    const [dataPresenca, setDataPresenca] = useState(new Date().toISOString().split('T')[0]);
    const [presencaStatus, setPresencaStatus] = useState(null);
    const [presencaId, setPresencaId] = useState(null);
    const [loadingPresenca, setLoadingPresenca] = useState(false);
    const [alunoId, setAlunoId] = useState(null);

    // Recuperar ID do aluno do localStorage (salvo no login)
    useEffect(() => {
        const storedId = localStorage.getItem('alunoId');
        const storedEmail = localStorage.getItem('userEmail');
        
        if (!storedId && !storedEmail) {
            navigate('/login');
            return;
        }

        if (storedId) {
            setAlunoId(storedId);
            loadAlunoData(storedId);
        }
    }, [navigate]);

    const loadAlunoData = async (id) => {
        try {
            // Carregar dados do aluno
            const alunoResp = await AlunoService.buscar(id);
            setAluno(alunoResp?.data || null);

            // Carregar planos do aluno
            const planosResp = await PlanoTreinoService.listar(id);
            const planosData = planosResp?.data || [];
            setPlanos(planosData);

            // Selecionar primeiro plano por padrão
            if (planosData.length > 0) {
                setSelectedPlano(planosData[0]);
                loadExerciciosPlano(planosData[0].id_planotreino || planosData[0].id);
            }

            // Carregar status de presença de hoje
            const freqResp = await FrequenciaService.listar();
            const all = freqResp?.data || [];
            const hoje = new Date().toISOString().split('T')[0];
            const hojePresenca = all.find(
                f => (f.id_aluno === parseInt(id) || f.dadosAluno?.id_aluno === parseInt(id)) &&
                    new Date(f.dia).toISOString().split('T')[0] === hoje
            );
            if (hojePresenca) {
                setPresencaStatus(hojePresenca.presenca);
                setPresencaId(hojePresenca.id_frequencia);
                setDataPresenca(hoje);
            }
        } catch (err) {
            console.error('Erro ao carregar dados do aluno', err);
        }
    };

    const loadExerciciosPlano = async (planoId) => {
        try {
            const itens = await PlanoExercicioService.listarPorPlano(planoId);
            const lista = (itens?.data || itens || []).map(it => ({
                id_planoexercicio: it.id_planoexercicio,
                id_exercicio: it.id_exercicio,
                nome: it.exercicio?.nome || it.nome || 'Exercício',
                series: it.series,
                repeticoes: it.repeticoes,
                carga: it.carga,
                descanso: it.descanso,
            }));
            setExerciciosPlano(lista);
        } catch (err) {
            console.error('Erro ao carregar exercícios do plano', err);
            setExerciciosPlano([]);
        }
    };

    const handleMarcarPresenca = async (status) => {
        if (!alunoId || !dataPresenca) return;
        setLoadingPresenca(true);

        try {
            if (presencaId) {
                // Já existe registro para esta data, atualizar
                const resp = await FrequenciaService.atualizar(presencaId, { presenca: status });
                setPresencaStatus(status);
            } else {
                // Criar novo registro
                const payload = {
                    id_aluno: parseInt(alunoId),
                    dia: dataPresenca,
                    presenca: status,
                };
                const resp = await FrequenciaService.criar(payload);
                setPresencaStatus(status);
                setPresencaId(resp.data.id_frequencia);
            }
        } catch (err) {
            console.error('Erro ao marcar presença', err);
            alert('Erro ao marcar presença: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoadingPresenca(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('alunoId');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    if (!aluno) {
        return <div style={{ padding: 20, color: '#fff' }}>Carregando...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
            {/* Top Bar */}
            <div style={{ background: '#111', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ffb81c' }}>
                <h1 style={{ margin: 0, fontSize: 24, color: '#ffb81c' }}>Academia</h1>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ color: '#ddd' }}>Bem-vindo, {aluno.nome}!</span>
                    <button onClick={handleLogout} style={{ background: '#c41e3a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
                        Sair
                    </button>
                </div>
            </div>

            <div style={{ padding: 20 }}>
                {/* Seção de Presença */}
                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ color: '#ffb81c', marginBottom: 16 }}>Marcar Presença</h2>
                    <div style={{ background: '#111', padding: 16, borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, maxWidth: 500 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, color: '#ddd', fontSize: 12 }}>Data</label>
                            <input
                                type="date"
                                value={dataPresenca}
                                onChange={(e) => {
                                    setDataPresenca(e.target.value);
                                    setPresencaStatus(null); // Limpar status ao mudar data
                                }}
                                style={{ width: '100%', padding: 8, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: 4 }}
                            />
                        </div>
                        <button
                            onClick={() => handleMarcarPresenca('Presente')}
                            disabled={loadingPresenca}
                            style={{
                                background: presencaStatus === 'Presente' ? '#28a745' : '#444',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: 4,
                                cursor: loadingPresenca ? 'wait' : 'pointer',
                                fontWeight: 600,
                                alignSelf: 'flex-end',
                            }}
                        >
                            {presencaStatus === 'Presente' ? '✓ Presente' : 'Presente'}
                        </button>
                        <button
                            onClick={() => handleMarcarPresenca('Falta')}
                            disabled={loadingPresenca}
                            style={{
                                background: presencaStatus === 'Falta' ? '#dc3545' : '#444',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: 4,
                                cursor: loadingPresenca ? 'wait' : 'pointer',
                                fontWeight: 600,
                                alignSelf: 'flex-end',
                            }}
                        >
                            {presencaStatus === 'Falta' ? '✓ Falta' : 'Falta'}
                        </button>
                    </div>
                    {presencaStatus && (
                        <p style={{ marginTop: 8, color: '#ffb81c', fontSize: 14 }}>
                            {presencaStatus === 'Presente' ? '✓ Presença marcada para ' : '✗ Falta registrada para '} {new Date(dataPresenca).toLocaleDateString()}
                        </p>
                    )}
                </section>

                {/* Seção de Treino */}
                <section>
                    <h2 style={{ color: '#ffb81c', marginBottom: 16 }}>Meus Treinos</h2>

                    {planos.length === 0 ? (
                        <p style={{ color: '#888' }}>Nenhum plano de treino atribuído.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                            {/* Lista de Planos */}
                            <div>
                                <h3 style={{ color: '#ddd', marginBottom: 12, fontSize: 16 }}>Planos</h3>
                                {planos.map(p => (
                                    <div
                                        key={p.id_planotreino || p.id}
                                        onClick={() => {
                                            setSelectedPlano(p);
                                            loadExerciciosPlano(p.id_planotreino || p.id);
                                        }}
                                        style={{
                                            background: (selectedPlano?.id_planotreino || selectedPlano?.id) === (p.id_planotreino || p.id) ? '#ffb81c' : '#111',
                                            color: (selectedPlano?.id_planotreino || selectedPlano?.id) === (p.id_planotreino || p.id) ? '#000' : '#fff',
                                            padding: 12,
                                            borderRadius: 4,
                                            marginBottom: 8,
                                            cursor: 'pointer',
                                            border: '1px solid ' + ((selectedPlano?.id_planotreino || selectedPlano?.id) === (p.id_planotreino || p.id) ? '#ffb81c' : '#444'),
                                            fontWeight: (selectedPlano?.id_planotreino || selectedPlano?.id) === (p.id_planotreino || p.id) ? 600 : 400,
                                        }}
                                    >
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nome}</div>
                                        {p.descricao && <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>{p.descricao}</div>}
                                    </div>
                                ))}
                            </div>

                            {/* Detalhes do Plano Selecionado */}
                            {selectedPlano && (
                                <div>
                                    <h3 style={{ color: '#ddd', marginBottom: 12, fontSize: 16 }}>{selectedPlano.nome}</h3>
                                    {selectedPlano.descricao && (
                                        <p style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{selectedPlano.descricao}</p>
                                    )}

                                    <h4 style={{ color: '#ffb81c', marginBottom: 12 }}>Exercícios</h4>
                                    {exerciciosPlano.length === 0 ? (
                                        <p style={{ color: '#888' }}>Sem exercícios neste plano.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gap: 12 }}>
                                            {exerciciosPlano.map((ex, idx) => (
                                                <div key={idx} style={{ background: '#111', padding: 12, borderRadius: 4, borderLeft: '4px solid #ffb81c' }}>
                                                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#ffb81c' }}>{idx + 1}. {ex.nome}</div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: '#ddd' }}>
                                                        <div>
                                                            <span style={{ color: '#888' }}>Séries:</span> {ex.series}
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#888' }}>Repetições:</span> {ex.repeticoes}
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#888' }}>Carga:</span> {ex.carga} kg
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#888' }}>Descanso:</span> {formatarDescanso(ex.descanso)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AlunoDashboard;
