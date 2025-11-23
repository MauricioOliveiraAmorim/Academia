import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlunoService from '../services/AlunoService';
import FrequenciaService from '../services/FrequenciaService';
import PlanoTreinoService from '../services/PlanoTreinoService';
import PlanoExercicioService from '../services/PlanoExercicioService';
import ExercicioService from '../services/ExercicioService';

// --- Estilos Dark Mode ---
const STYLES = {
    COLOR_BACKGROUND: '#0a0a0a',
    COLOR_FOREGROUND: '#1c1c1c',
    COLOR_HIGHLIGHT: '#ffb81c',
    COLOR_RED: '#c41e3a',
    COLOR_GREEN: '#4CAF50',
    COLOR_TEXT: '#ddd',
    COLOR_TEXT_SECONDARY: '#888',

    inputBase: {
        padding: '8px',
        background: '#222',
        border: '1px solid #444',
        color: '#fff',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    buttonBase: {
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s, color 0.2s',
    },
    monthNavButton: {
        background: '#333',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
    }
};

// Funções Auxiliares (mantidas as que você já tinha)
function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
function daysInMonth(date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    return new Date(y, m + 1, 0).getDate();
}
function getDaysInMonth(date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const startDay = new Date(y, m, 1).getDay(); // 0 = Domingo, 1 = Segunda...
    return { totalDays, startDay };
}

const AlunoDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [aluno, setAluno] = useState(null);
    const [frequencias, setFrequencias] = useState([]);
    const [presentMap, setPresentMap] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayKey, setSelectedDayKey] = useState(null);
    const [planos, setPlanos] = useState([]);
    const [exerciciosList, setExerciciosList] = useState([]);
    const [selectedExercisePerPlan, setSelectedExercisePerPlan] = useState({});
    const [novoPlano, setNovoPlano] = useState({ nome: '', descricao: '', duracao: '' });
    const [loadingPlanos, setLoadingPlanos] = useState(false);
    const [exercicioFormPerPlan, setExercicioFormPerPlan] = useState({});

    const { totalDays, startDay } = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // ----------------------
    // --- Lógica de Carregamento ---
    // ----------------------
    useEffect(() => {
        async function load() {
            try {
                const alunoResp = await AlunoService.buscar(id);
                setAluno(alunoResp?.data || null);

                const freqResp = await FrequenciaService.listar();
                const all = freqResp?.data || [];
                const meus = all.filter(f => f.id_aluno === parseInt(id) || f.dadosAluno?.id_aluno === parseInt(id));
                
                const map = {};
                meus.forEach(f => {
                    const d = new Date(f.dia);
                    const key = d.toISOString().slice(0, 10);
                    map[key] = { id: f.id_frequencia || f.id_frequencia, presenca: f.presenca };
                });
                setPresentMap(map);
                setFrequencias(meus);

                const todayKey = new Date().toISOString().slice(0, 10);
                setSelectedDayKey(todayKey);

                try {
                    const exResp = await ExercicioService.listar();
                    setExerciciosList(exResp?.data || []);
                } catch (ex) {
                    console.error('Erro ao carregar exercícios', ex);
                }

                setLoadingPlanos(true);
                try {
                    const planosResp = await PlanoTreinoService.listar(id);
                    const planosData = planosResp?.data || [];
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

    // ----------------------
    // --- Lógica de Navegação de Mês ---
    // ----------------------
    const goToPreviousMonth = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate.getTime());
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const goToNextMonth = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate.getTime());
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    // Lógica de seleção do dia
    const selectDay = (day) => {
        const d = new Date(year, month, day);
        const key = d.toISOString().slice(0, 10);
        setSelectedDayKey(key);
    };

    // ----------------------
    // --- Lógica dos Handlers (FUNÇÕES ORIGINAIS) ---
    // ----------------------
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
                duracao: parseInt(novoPlano.duracao) || 0,
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
        const exerciseId = parseInt(selectedExercisePerPlan[planoId]);
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
                if ((p.id_planotreino || p.id) === planoId) {
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
                if ((p.id_planotreino || p.id) === planoId) {
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
            setPlanos(prev => prev.filter(p => (p.id_planotreino || p.id) !== planoId));
        } catch (err) {
            console.error('Erro ao deletar plano', err);
            alert('Erro ao deletar plano');
        }
    };
    // ------------------------------------------------

    if (!aluno) return <div style={{ padding: 20, color: STYLES.COLOR_TEXT }}>Carregando...</div>;

    return (
        <div style={{ padding: 20, color: STYLES.COLOR_TEXT, background: STYLES.COLOR_BACKGROUND, minHeight: '100vh' }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{...STYLES.buttonBase, background: STYLES.COLOR_FOREGROUND, color: STYLES.COLOR_TEXT, border: '1px solid #444', marginBottom: 16 }}>
                ← Voltar
            </button>
            
            <h2 style={{ borderBottom: `2px solid ${STYLES.COLOR_HIGHLIGHT}`, paddingBottom: 10 }}>{aluno.nome} — Detalhes do Aluno</h2>
            
            <div style={{ display: 'flex', gap: 30, marginTop: 30 }}>
                
                {/* --------------------------- */}
                {/* 1. PLANOS E EXERCÍCIOS */}
                {/* --------------------------- */}
                <section style={{ flex: 2, background: STYLES.COLOR_FOREGROUND, padding: 20, borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    <h3 style={{ color: STYLES.COLOR_HIGHLIGHT, marginBottom: 15 }}>Planos de Treino</h3>
                    
                    {/* A) Formulário de Criação de Plano (Mais Limpo) */}
                    <div style={{ marginBottom: 20, padding: 15, background: '#0a0a0a', border: `1px dashed ${STYLES.COLOR_TEXT_SECONDARY}`, borderRadius: 6 }}>
                        <strong style={{ color: STYLES.COLOR_TEXT, display: 'block', marginBottom: 8 }}>Criar Novo Plano</strong>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input
                                type="text"
                                placeholder="Nome (Ex: Treino A - Peito)"
                                value={novoPlano.nome}
                                onChange={(e) => setNovoPlano({ ...novoPlano, nome: e.target.value })}
                                style={{ ...STYLES.inputBase, flex: 1 }}
                            />
                            <input
                                type="text"
                                placeholder="Duração (Semanas, opcional)"
                                value={novoPlano.duracao}
                                onChange={(e) => setNovoPlano({ ...novoPlano, duracao: e.target.value.replace(/[^0-9]/g, '') })} 
                                style={{ ...STYLES.inputBase, width: 120 }}
                            />
                            <button onClick={handleCriarPlano} disabled={loadingPlanos} style={{ ...STYLES.buttonBase, background: STYLES.COLOR_HIGHLIGHT, color: '#000' }}>
                                {loadingPlanos ? 'Criando...' : '+ Plano'}
                            </button>
                        </div>
                    </div>

                    {/* B) Lista de Planos Existentes */}
                    <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                        {planos.length === 0 && <p style={{ fontStyle: 'italic', color: STYLES.COLOR_TEXT_SECONDARY }}>{loadingPlanos ? 'Carregando planos...' : 'Nenhum plano criado.'}</p>}
                        
                        {planos.map(pl => {
                            const planoId = pl.id_planotreino || pl.id;
                            const currentForm = exercicioFormPerPlan[planoId] || {};
                            const currentSelectedExercise = selectedExercisePerPlan[planoId] || '';

                            return (
                                <div key={planoId} style={{ background: '#2a2a2a', padding: 15, borderRadius: 6, marginBottom: 15, borderLeft: `5px solid ${STYLES.COLOR_HIGHLIGHT}` }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <strong style={{ color: STYLES.COLOR_HIGHLIGHT, fontSize: 16 }}>{pl.nome} {pl.duracao > 0 && `(${pl.duracao} Semanas)`}</strong>
                                        <button 
                                            onClick={() => handleDeletarPlano(planoId)} 
                                            style={{ ...STYLES.buttonBase, background: STYLES.COLOR_RED, color: '#fff', padding: '4px 8px', fontSize: 12 }}>
                                            Deletar
                                        </button>
                                    </div>
                                    {pl.descricao && <p style={{ color: STYLES.COLOR_TEXT_SECONDARY, fontSize: 12, marginTop: -5, marginBottom: 10 }}>{pl.descricao}</p>}
                                    
                                    {/* Lista de Exercícios do Plano */}
                                    <div style={{ padding: '8px 0' }}>
                                        {pl.exercicios.length === 0 && <div style={{ color: STYLES.COLOR_TEXT_SECONDARY, fontStyle: 'italic' }}>Nenhum exercício neste plano.</div>}
                                        {pl.exercicios.map((ex, i) => (
                                            <div key={ex.id_planoexercicio} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: STYLES.COLOR_TEXT, marginBottom: 4, padding: 6, background: '#111', borderRadius: 4 }}>
                                                <div>
                                                    <strong style={{ marginRight: 10 }}>{ex.nome}</strong>
                                                    <span style={{ fontSize: 11, color: STYLES.COLOR_TEXT_SECONDARY }}>{ex.series}x{ex.repeticoes} | {ex.carga}kg | {ex.descanso}</span>
                                                </div>
                                                <button onClick={() => handleDeletarExercicioPlano(planoId, ex.id_planoexercicio)} style={{ ...STYLES.buttonBase, background: STYLES.COLOR_RED, color: '#fff', padding: '3px 6px', fontSize: 11 }}>
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* C) Adicionar Exercício ao Plano (Melhorado) */}
                                    <div style={{ marginTop: 10, padding: 10, background: '#111', borderRadius: 6 }}>
                                        <strong style={{ color: STYLES.COLOR_TEXT, display: 'block', marginBottom: 8, fontSize: 14 }}>Adicionar Exercício</strong>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                                            <input type="number" placeholder="Séries (3)" value={currentForm.series || ''} onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: { ...prev[planoId], series: e.target.value } }))} style={STYLES.inputBase} />
                                            <input type="number" placeholder="Reps (10)" value={currentForm.repeticoes || ''} onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: { ...prev[planoId], repeticoes: e.target.value } }))} style={STYLES.inputBase} />
                                            <input type="number" placeholder="Carga (kg)" value={currentForm.carga || ''} onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: { ...prev[planoId], carga: e.target.value } }))} style={STYLES.inputBase} />
                                            <input type="text" placeholder="Descanso (1m)" value={currentForm.descanso || ''} onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: { ...prev[planoId], descanso: e.target.value } }))} style={STYLES.inputBase} />
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <select
                                                value={currentSelectedExercise}
                                                onChange={(e) => setSelectedExercisePerPlan(prev => ({ ...prev, [planoId]: e.target.value }))}
                                                style={{ ...STYLES.inputBase, flex: 1 }}
                                            >
                                                <option value="">-- Selecione o exercício --</option>
                                                {exerciciosList.map(ex => (
                                                    <option key={ex.id_exercicio} value={ex.id_exercicio}>{ex.nome} ({ex.grupomuscular})</option>
                                                ))}
                                            </select>
                                            <button 
                                                onClick={() => handleAdicionarExercicio(planoId)} 
                                                style={{ ...STYLES.buttonBase, background: STYLES.COLOR_GREEN, color: '#fff', fontWeight: 600 }}>
                                                Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* --------------------------- */}
                {/* 2. FREQUÊNCIA (CALENDÁRIO) */}
                {/* --------------------------- */}
                <section style={{ flex: 1, background: STYLES.COLOR_FOREGROUND, padding: 20, borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', minWidth: 360 }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <button onClick={goToPreviousMonth} style={{ ...STYLES.buttonBase, ...STYLES.monthNavButton }}>&lt;</button>

                        <h3 style={{ color: STYLES.COLOR_HIGHLIGHT, margin: 0, textAlign: 'center' }}>
                            Frequência — {currentDate.toLocaleString('pt-BR',{month:'long', year: 'numeric'})}
                        </h3>
                        
                        <button onClick={goToNextMonth} style={{ ...STYLES.buttonBase, ...STYLES.monthNavButton }}>&gt;</button>
                    </div>

                    {/* Nomes dos dias da semana */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, textAlign: 'center', marginBottom: 5 }}>
                        {dayNames.map(name => (
                            <strong key={name} style={{ color: STYLES.COLOR_TEXT_SECONDARY, fontSize: 12 }}>{name}</strong>
                        ))}
                    </div>

                    {/* Calendário de Dias */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
                        {/* Espaços vazios para o início do mês */}
                        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} style={{ height: 36 }}></div>)}
                        
                        {/* Dias do Mês */}
                        {Array.from({ length: totalDays }).map((_, idx) => {
                            const day = idx + 1;
                            const d = new Date(year, month, day);
                            const key = d.toISOString().slice(0, 10);
                            const freqData = presentMap[key];
                            const isPresent = Boolean(freqData);
                            const isSelected = selectedDayKey === key;
                            
                            const dayStyle = {
                                width: '100%', height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                background: isSelected ? STYLES.COLOR_HIGHLIGHT : (isPresent ? STYLES.COLOR_GREEN : '#1a1a1a'),
                                border: isSelected ? `2px solid ${STYLES.COLOR_HIGHLIGHT}` : '2px solid transparent',
                                color: isPresent ? '#0a0a0a' : STYLES.COLOR_TEXT, 
                                fontWeight: 600, 
                                fontSize: 14
                            };

                            return (
                                <div key={key} onClick={() => selectDay(day)} style={dayStyle}>
                                    {day}
                                </div>
                            );
                        })}
                    </div>

                    {/* Status do Dia Selecionado */}
                    <div style={{ marginTop: 20, padding: 12, background: '#111', borderRadius: 6 }}>
                        <strong style={{ display: 'block', marginBottom: 8 }}>Status: {selectedDayKey && new Date(selectedDayKey).toLocaleDateString('pt-BR')}</strong>
                        <div style={{ fontSize: 16 }}>
                            {selectedDayKey ? (
                                presentMap[selectedDayKey] ? (
                                    <span style={{ color: STYLES.COLOR_GREEN, fontWeight: 700 }}>PRESENTE</span>
                                ) : (
                                    <span style={{ color: STYLES.COLOR_RED, fontWeight: 700 }}>AUSENTE</span>
                                )
                            ) : (
                                <span style={{ color: STYLES.COLOR_TEXT_SECONDARY }}>Selecione um dia no calendário.</span>
                            )}
                        </div>
                    </div>
                </section>
                
            </div>
        </div>
    );
};

export default AlunoDetalhes;