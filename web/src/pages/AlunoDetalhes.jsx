import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlunoService from '../services/AlunoService';
import FrequenciaService from '../services/FrequenciaService';
import PlanoTreinoService from '../services/PlanoTreinoService';
import PlanoExercicioService from '../services/PlanoExercicioService';
import ExercicioService from '../services/ExercicioService';

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    return new Date(y, m+1, 0).getDate();
}

const AlunoDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [aluno, setAluno] = useState(null);
    const [frequencias, setFrequencias] = useState([]);
    const [presentMap, setPresentMap] = useState({}); // dateString -> { id, presenca }
    const [currentDate] = useState(new Date());
    const [selectedDayKey, setSelectedDayKey] = useState(null);
    const [planos, setPlanos] = useState([]); // planos persistidos
    const [exerciciosList, setExerciciosList] = useState([]);
    const [selectedExercisePerPlan, setSelectedExercisePerPlan] = useState({});
    const [novoPlano, setNovoPlano] = useState({ nome: '', descricao: '', duracao: '' });
    const [loadingPlanos, setLoadingPlanos] = useState(false);
    const [exercicioFormPerPlan, setExercicioFormPerPlan] = useState({});

    useEffect(() => {
        async function load() {
            try {
                const alunoResp = await AlunoService.buscar(id);
                setAluno(alunoResp?.data || null);

                const freqResp = await FrequenciaService.listar();
                const all = freqResp?.data || [];
                const meus = all.filter(f => f.id_aluno === parseInt(id) || f.dadosAluno?.id_aluno === parseInt(id));
                setFrequencias(meus);

                const map = {};
                meus.forEach(f => {
                    const d = new Date(f.dia);
                    const key = d.toISOString().slice(0,10);
                    map[key] = { id: f.id_frequencia || f.id_frequencia, presenca: f.presenca };
                });
                setPresentMap(map);

                // inicia seleção no dia atual se existir no mês
                const todayKey = new Date().toISOString().slice(0,10);
                setSelectedDayKey(todayKey);

                // carregar exercícios disponíveis
                try {
                    const exResp = await ExercicioService.listar();
                    setExerciciosList(exResp?.data || []);
                } catch (ex) {
                    console.error('Erro ao carregar exercícios', ex);
                }

                // carregar planos do aluno
                setLoadingPlanos(true);
                try {
                    const planosResp = await PlanoTreinoService.listar(id);
                    const planosData = planosResp?.data || [];
                    // para cada plano, buscar exercícios do plano
                    const planosComEx = await Promise.all(planosData.map(async p => {
                        try {
                            const itens = await PlanoExercicioService.listarPorPlano(p.id_planotreino || p.id);
                            const lista = (itens?.data || itens || []).map(it => ({
                                id_planoexercicio: it.id_planoexercicio,
                                id_exercicio: it.id_exercicio,
                                nome: it.exercicio?.nome || it.nome || 'Exercício',
                                series: it.series,
                                repeticoes: it.repeticoes,
                                carga: it.carga,
                                descanso: it.descanso,
                            }));
                            return { ...p, exercicios: lista };
                        } catch (err) {
                            return { ...p, exercicios: [] };
                        }
                    }));
                    setPlanos(planosComEx);
                } catch (err) {
                    console.error('Erro ao carregar planos', err);
                }
                setLoadingPlanos(false);
            } catch (err) {
                console.error(err);
                setLoadingPlanos(false);
            }
        }

        load();
    }, [id]);

    // seleção apenas: mostra se presente ou ausente no dia selecionado
    const selectDay = (day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const d = new Date(year, month, day);
        const key = d.toISOString().slice(0,10);
        setSelectedDayKey(key);
    };

    const handleCriarPlano = async () => {
        if (!novoPlano.nome.trim()) {
            alert('Nome do plano é obrigatório');
            return;
        }
        try {
            const response = await PlanoTreinoService.criar({
                id_aluno: parseInt(id),
                id_instrutor: 1, // será ajustado para usar instrutor autenticado
                nome: novoPlano.nome,
                descricao: novoPlano.descricao || '',
                duracao: novoPlano.duracao || 0,
            });
            const newPlan = { ...response.data, exercicios: [] };
            setPlanos(prev => [newPlan, ...prev]);
            setNovoPlano({ nome: '', descricao: '', duracao: '' });
        } catch (err) {
            console.error('Erro ao criar plano', err);
            alert('Erro ao criar plano');
        }
    };

    const handleAdicionarExercicio = async (planoId) => {
        const exerciseId = selectedExercisePerPlan[planoId];
        if (!exerciseId) {
            alert('Selecione um exercício');
            return;
        }
        const form = exercicioFormPerPlan[planoId] || {};
        const series = parseInt(form.series) || 3;
        const repeticoes = parseInt(form.repeticoes) || 10;
        const carga = parseInt(form.carga) || 0;
        const descanso = form.descanso || '00:01:00';

        try {
            const response = await PlanoExercicioService.criar({
                id_planotreino: planoId,
                id_exercicio: exerciseId,
                series,
                repeticoes,
                carga,
                descanso,
            });
            const planoAtualizado = planos.map(p => {
                if (p.id_planotreino === planoId) {
                    const exerciseData = exerciciosList.find(e => e.id_exercicio === exerciseId);
                    const novoItem = {
                        id_planoexercicio: response.data.id_planoexercicio,
                        id_exercicio: exerciseId,
                        nome: exerciseData?.nome || 'Exercício',
                        series,
                        repeticoes,
                        carga,
                        descanso,
                    };
                    return { ...p, exercicios: [...p.exercicios, novoItem] };
                }
                return p;
            });
            setPlanos(planoAtualizado);
            setSelectedExercisePerPlan(prev => ({ ...prev, [planoId]: '' }));
            setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: {} }));
        } catch (err) {
            console.error('Erro ao adicionar exercício', err);
            alert('Erro ao adicionar exercício');
        }
    };

    const handleDeletarExercicioPlano = async (planoId, exercicioId) => {
        if (!window.confirm('Remover exercício?')) return;
        try {
            await PlanoExercicioService.deletar(exercicioId);
            setPlanos(prev => prev.map(p => {
                if (p.id_planotreino === planoId) {
                    return { ...p, exercicios: p.exercicios.filter(e => e.id_planoexercicio !== exercicioId) };
                }
                return p;
            }));
        } catch (err) {
            console.error('Erro ao deletar exercício', err);
            alert('Erro ao deletar exercício');
        }
    };

    const handleDeletarPlano = async (planoId) => {
        if (!window.confirm('Deletar plano inteiro?')) return;
        try {
            await PlanoTreinoService.deletar(planoId);
            setPlanos(prev => prev.filter(p => p.id_planotreino !== planoId));
        } catch (err) {
            console.error('Erro ao deletar plano', err);
            alert('Erro ao deletar plano');
        }
    };

    if (!aluno) return <div style={{ padding: 20 }}>Carregando...</div>;

    // construindo dias do mês
    const totalDays = daysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return (
        <div style={{ padding: 20, color: '#fff' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>Voltar</button>
            <h2>{aluno.nome} — Detalhes</h2>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                <section style={{ flex: 1 }}>
                    <h3>Informações do Treino</h3>
                    <p>CPF: {aluno.cpf}</p>
                    <p>Data Matrícula: {new Date(aluno.datamatricula || aluno.datamatricula || Date.now()).toLocaleDateString()}</p>

                    <div style={{ marginTop: 20 }}>
                        <h4>Planos de Treino</h4>
                        <div style={{ marginBottom: 12, padding: 8, background: '#111', borderRadius: 6 }}>
                            <input
                                type="text"
                                placeholder="Nome do plano"
                                value={novoPlano.nome}
                                onChange={(e) => setNovoPlano({ ...novoPlano, nome: e.target.value })}
                                style={{ width: '100%', padding: 6, marginBottom: 6, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: 4 }}
                            />
                            <input
                                type="text"
                                placeholder="Descrição (opcional)"
                                value={novoPlano.descricao}
                                onChange={(e) => setNovoPlano({ ...novoPlano, descricao: e.target.value })}
                                style={{ width: '100%', padding: 6, marginBottom: 6, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: 4 }}
                            />
                            <button onClick={handleCriarPlano} disabled={loadingPlanos} style={{ marginTop: 6 }}>
                                {loadingPlanos ? 'Criando...' : '+ Novo Plano'}
                            </button>
                        </div>
                        {planos.length === 0 && <p style={{ fontStyle: 'italic' }}>{loadingPlanos ? 'Carregando...' : 'Nenhum plano criado.'}</p>}
                        {planos.map(pl => (
                            <div key={pl.id_planotreino || pl.id} style={{ background: '#111', padding: 8, borderRadius: 6, marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ color: '#ffb81c' }}>{pl.nome}</strong>
                                    <button onClick={() => handleDeletarPlano(pl.id_planotreino || pl.id)} style={{ background: '#c41e3a', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                                        Deletar
                                    </button>
                                </div>
                                {pl.descricao && <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{pl.descricao}</p>}
                                <div style={{ marginTop: 8 }}>
                                    {pl.exercicios.length === 0 && <div style={{ color: '#888' }}>Sem exercícios</div>}
                                    {pl.exercicios.map((ex, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ddd', marginBottom: 4, padding: 4, background: '#0a0a0a', borderRadius: 4 }}>
                                            <div>
                                                <div>{ex.nome}</div>
                                                <div style={{ fontSize: 11, color: '#888' }}>{ex.series}x {ex.repeticoes} | {ex.carga}kg | {ex.descanso}s</div>
                                            </div>
                                            <button onClick={() => handleDeletarExercicioPlano(pl.id_planotreino || pl.id, ex.id_planoexercicio)} style={{ background: '#c41e3a', color: '#fff', border: 'none', padding: '4px 6px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                                        <input
                                            type="number"
                                            placeholder="Séries"
                                            value={exercicioFormPerPlan[pl.id_planotreino || pl.id]?.series || '3'}
                                            onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [pl.id_planotreino || pl.id]: { ...prev[pl.id_planotreino || pl.id], series: e.target.value } }))}
                                            style={{ padding: 6, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: 4 }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Reps"
                                            value={exercicioFormPerPlan[pl.id_planotreino || pl.id]?.repeticoes || '10'}
                                            onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [pl.id_planotreino || pl.id]: { ...prev[pl.id_planotreino || pl.id], repeticoes: e.target.value } }))}
                                            style={{ padding: 6, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: 4 }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Carga (kg)"
                                            value={exercicioFormPerPlan[pl.id_planotreino || pl.id]?.carga || '0'}
                                            onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [pl.id_planotreino || pl.id]: { ...prev[pl.id_planotreino || pl.id], carga: e.target.value } }))}
                                            style={{ padding: 6, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: 4 }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Descanso (HH:MM:SS)"
                                            value={exercicioFormPerPlan[pl.id_planotreino || pl.id]?.descanso || '00:01:00'}
                                            onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [pl.id_planotreino || pl.id]: { ...prev[pl.id_planotreino || pl.id], descanso: e.target.value } }))}
                                            style={{ padding: 6, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: 4 }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <select
                                            value={selectedExercisePerPlan[pl.id_planotreino || pl.id] || ''}
                                            onChange={(e) => setSelectedExercisePerPlan(prev => ({ ...prev, [pl.id_planotreino || pl.id]: e.target.value }))}
                                            style={{ padding: 6, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: 4, flex: 1 }}
                                        >
                                            <option value="">Selecionar exercício...</option>
                                            {exerciciosList.map(ex => (
                                                <option key={ex.id_exercicio} value={ex.id_exercicio}>{ex.nome}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleAdicionarExercicio(pl.id_planotreino || pl.id)} style={{ background: '#ffb81c', color: '#000', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ minWidth: 360 }}>
                    <h3>Frequência — {currentDate.toLocaleString('default',{month:'long', year: 'numeric'})}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: 6 }}>
                        {Array.from({ length: totalDays }).map((_, idx) => {
                            const day = idx + 1;
                            const d = new Date(year, month, day);
                            const key = d.toISOString().slice(0,10);
                            const isPresent = Boolean(presentMap[key]);
                            const isSelected = selectedDayKey === key;
                            return (
                                <div key={key} onClick={() => selectDay(day)} style={{ width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: isSelected ? '#2a2a2a' : (isPresent ? '#ffb81c' : '#1a1a1a'), border: isSelected ? '2px solid #ffb81c' : '2px solid transparent' }}>
                                    <span style={{ color: isPresent ? '#0a0a0a' : '#ddd', fontWeight: 600, fontSize: 12 }}>{day}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 12, padding: 8, background: '#111', borderRadius: 6 }}>
                        <strong>Status do dia selecionado:</strong>
                        <div style={{ marginTop: 8 }}>
                            {selectedDayKey ? (
                                presentMap[selectedDayKey] ? (
                                    <span style={{ color: '#ffb81c', fontWeight: 700 }}>Presente</span>
                                ) : (
                                    <span style={{ color: '#888' }}>Ausente</span>
                                )
                            ) : (
                                <span style={{ color: '#888' }}>Selecione um dia</span>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AlunoDetalhes;
