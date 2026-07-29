import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlunoService from '../services/AlunoService';
import FrequenciaService from '../services/FrequenciaService';
import PlanoTreinoService from '../services/PlanoTreinoService';
import PlanoExercicioService from '../services/PlanoExercicioService';
import ExercicioService from '../services/ExercicioService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { cx } from '../components/ui/cx';

function getDaysInMonth(date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const startDay = new Date(y, m, 1).getDay();
    return { totalDays, startDay };
}

const AlunoDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [aluno, setAluno] = useState(null);
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
                    map[key] = { id: f.id_frequencia, presenca: f.presenca };
                });
                setPresentMap(map);

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
                        } catch {
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

    const selectDay = (day) => {
        const d = new Date(year, month, day);
        const key = d.toISOString().slice(0, 10);
        setSelectedDayKey(key);
    };

    const handleCriarPlano = async () => {
        if (!novoPlano.nome.trim()) {
            alert('Nome do plano é obrigatório');
            return;
        }
        const idInstrutor = parseInt(localStorage.getItem('userId'));
        if (!idInstrutor) {
            alert('Não foi possível identificar o instrutor logado. Faça login novamente.');
            return;
        }
        try {
            const response = await PlanoTreinoService.criar({
                id_aluno: parseInt(id),
                id_instrutor: idInstrutor,
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

    if (!aluno) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gotham-950 text-gotham-300">
                Carregando...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gotham-950 px-6 py-6">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="mb-4">
                ← Voltar
            </Button>

            <h2 className="mb-6 border-b-2 border-bat-yellow-500 pb-3 font-display text-3xl tracking-wide text-gotham-100">
                {aluno.nome} — Detalhes do Aluno
            </h2>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
                {/* Planos e exercícios */}
                <Card className="p-5">
                    <h3 className="mb-4 font-display text-xl tracking-wide text-bat-yellow-500">Planos de Treino</h3>

                    <div className="mb-5 rounded-lg border border-dashed border-gotham-500 bg-gotham-950 p-4">
                        <strong className="mb-2 block text-sm text-gotham-100">Criar Novo Plano</strong>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                type="text"
                                placeholder="Nome (Ex: Treino A - Peito)"
                                value={novoPlano.nome}
                                onChange={(e) => setNovoPlano({ ...novoPlano, nome: e.target.value })}
                                className="flex-1"
                            />
                            <Input
                                type="text"
                                placeholder="Duração (semanas)"
                                value={novoPlano.duracao}
                                onChange={(e) => setNovoPlano({ ...novoPlano, duracao: e.target.value.replace(/[^0-9]/g, '') })}
                                className="sm:w-36"
                            />
                            <Button onClick={handleCriarPlano} disabled={loadingPlanos}>
                                {loadingPlanos ? 'Criando...' : '+ Plano'}
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-[600px] space-y-4 overflow-y-auto pr-1">
                        {planos.length === 0 && (
                            <p className="italic text-gotham-300">{loadingPlanos ? 'Carregando planos...' : 'Nenhum plano criado.'}</p>
                        )}

                        {planos.map(pl => {
                            const planoId = pl.id_planotreino || pl.id;
                            const currentForm = exercicioFormPerPlan[planoId] || {};
                            const currentSelectedExercise = selectedExercisePerPlan[planoId] || '';

                            return (
                                <Card key={planoId} className="border-l-4 border-l-bat-yellow-500 bg-gotham-800 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <strong className="text-base text-bat-yellow-500">
                                            {pl.nome} {pl.duracao > 0 && `(${pl.duracao} Semanas)`}
                                        </strong>
                                        <Button variant="danger" size="sm" onClick={() => handleDeletarPlano(planoId)}>
                                            Deletar
                                        </Button>
                                    </div>
                                    {pl.descricao && <p className="mb-2 -mt-1 text-xs text-gotham-300">{pl.descricao}</p>}

                                    <div className="space-y-1.5 py-1">
                                        {pl.exercicios.length === 0 && (
                                            <div className="italic text-gotham-300">Nenhum exercício neste plano.</div>
                                        )}
                                        {pl.exercicios.map((ex) => (
                                            <div key={ex.id_planoexercicio} className="flex items-center justify-between rounded bg-gotham-950 px-3 py-1.5 text-gotham-100">
                                                <div>
                                                    <strong className="mr-2.5">{ex.nome}</strong>
                                                    <span className="text-xs text-gotham-300">{ex.series}x{ex.repeticoes} | {ex.carga}kg | {ex.descanso}</span>
                                                </div>
                                                <Button variant="danger" size="sm" className="px-2 py-1 text-xs" onClick={() => handleDeletarExercicioPlano(planoId, ex.id_planoexercicio)}>
                                                    ✕
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 rounded-lg bg-gotham-950 p-3">
                                        <strong className="mb-2 block text-sm text-gotham-100">Adicionar Exercício</strong>

                                        <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            <Input type="number" placeholder="Séries (3)" value={currentForm.series || ''} onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: { ...prev[planoId], series: e.target.value } }))} />
                                            <Input type="number" placeholder="Reps (10)" value={currentForm.repeticoes || ''} onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: { ...prev[planoId], repeticoes: e.target.value } }))} />
                                            <Input type="number" placeholder="Carga (kg)" value={currentForm.carga || ''} onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: { ...prev[planoId], carga: e.target.value } }))} />
                                            <Input type="text" placeholder="Descanso (1m)" value={currentForm.descanso || ''} onChange={(e) => setExercicioFormPerPlan(prev => ({ ...prev, [planoId]: { ...prev[planoId], descanso: e.target.value } }))} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={currentSelectedExercise}
                                                onChange={(e) => setSelectedExercisePerPlan(prev => ({ ...prev, [planoId]: e.target.value }))}
                                                className="flex-1"
                                            >
                                                <option value="">-- Selecione o exercício --</option>
                                                {exerciciosList.map(ex => (
                                                    <option key={ex.id_exercicio} value={ex.id_exercicio}>{ex.nome} ({ex.grupomuscular})</option>
                                                ))}
                                            </Select>
                                            <Button variant="success" onClick={() => handleAdicionarExercicio(planoId)}>
                                                Adicionar
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </Card>

                {/* Frequência */}
                <Card className="min-w-0 p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <Button variant="secondary" size="sm" onClick={goToPreviousMonth}>&lt;</Button>
                        <h3 className="text-center font-display text-lg tracking-wide text-bat-yellow-500">
                            Frequência — {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <Button variant="secondary" size="sm" onClick={goToNextMonth}>&gt;</Button>
                    </div>

                    <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center">
                        {dayNames.map(name => (
                            <strong key={name} className="text-xs text-gotham-300">{name}</strong>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="h-9" />)}

                        {Array.from({ length: totalDays }).map((_, idx) => {
                            const day = idx + 1;
                            const d = new Date(year, month, day);
                            const key = d.toISOString().slice(0, 10);
                            const freqData = presentMap[key];
                            const isPresent = freqData?.presenca === 'Presente';
                            const isFalta = freqData?.presenca === 'Falta';
                            const isSelected = selectedDayKey === key;

                            return (
                                <div
                                    key={key}
                                    onClick={() => selectDay(day)}
                                    className={cx(
                                        'flex h-9 w-full cursor-pointer items-center justify-center rounded-md border-2 text-sm font-semibold transition-colors',
                                        isSelected
                                            ? 'border-bat-yellow-500 bg-bat-yellow-500 text-gotham-950'
                                            : isPresent
                                                ? 'border-transparent bg-bat-green-500 text-gotham-950'
                                                : isFalta
                                                    ? 'border-transparent bg-bat-red-500 text-gotham-950'
                                                    : 'border-transparent bg-gotham-700 text-gotham-100 hover:bg-gotham-600'
                                    )}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 rounded-lg bg-gotham-950 p-3">
                        <strong className="mb-2 block">Status: {selectedDayKey && new Date(selectedDayKey).toLocaleDateString('pt-BR')}</strong>
                        <div className="text-base">
                            {selectedDayKey ? (
                                presentMap[selectedDayKey]?.presenca === 'Presente' ? (
                                    <span className="font-bold text-bat-green-500">PRESENTE</span>
                                ) : presentMap[selectedDayKey]?.presenca === 'Falta' ? (
                                    <span className="font-bold text-bat-red-500">FALTA</span>
                                ) : (
                                    <span className="text-gotham-300">Não registrado</span>
                                )
                            ) : (
                                <span className="text-gotham-300">Selecione um dia no calendário.</span>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AlunoDetalhes;
