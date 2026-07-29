import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlunoService from '../services/AlunoService';
import FrequenciaService from '../services/FrequenciaService';
import PlanoTreinoService from '../services/PlanoTreinoService';
import PlanoExercicioService from '../services/PlanoExercicioService';
import Topbar from '../components/ui/Topbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { cx } from '../components/ui/cx';

const formatarDescanso = (descanso) => {
    if (!descanso) return '—';
    try {
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
            const alunoResp = await AlunoService.buscar(id);
            setAluno(alunoResp?.data || null);

            const planosResp = await PlanoTreinoService.listar(id);
            const planosData = planosResp?.data || [];
            setPlanos(planosData);

            if (planosData.length > 0) {
                setSelectedPlano(planosData[0]);
                loadExerciciosPlano(planosData[0].id_planotreino || planosData[0].id);
            }

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
                url_video: it.exercicio?.url_video
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
                await FrequenciaService.atualizar(presencaId, { presenca: status });
                setPresencaStatus(status);
            } else {
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
        return (
            <div className="flex min-h-screen items-center justify-center bg-gotham-950 text-gotham-300">
                Carregando...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gotham-950">
            <Topbar
                subtitle={`Bem-vindo, ${aluno.nome}!`}
                right={<Button variant="danger" size="sm" onClick={handleLogout}>Sair</Button>}
            />

            <main className="mx-auto max-w-6xl px-6 py-8">
                <section className="mb-10">
                    <h2 className="mb-4 font-display text-2xl tracking-wide text-bat-yellow-500">Marcar Presença</h2>
                    <Card className="max-w-lg p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <Label htmlFor="dataPresenca">Data</Label>
                                <Input
                                    id="dataPresenca"
                                    type="date"
                                    value={dataPresenca}
                                    onChange={(e) => {
                                        setDataPresenca(e.target.value);
                                        setPresencaStatus(null);
                                    }}
                                />
                            </div>
                            <Button
                                variant={presencaStatus === 'Presente' ? 'success' : 'secondary'}
                                onClick={() => handleMarcarPresenca('Presente')}
                                disabled={loadingPresenca}
                                className="self-end"
                            >
                                {presencaStatus === 'Presente' ? '✓ Presente' : 'Presente'}
                            </Button>
                            <Button
                                variant={presencaStatus === 'Falta' ? 'danger' : 'secondary'}
                                onClick={() => handleMarcarPresenca('Falta')}
                                disabled={loadingPresenca}
                                className="self-end"
                            >
                                {presencaStatus === 'Falta' ? '✓ Falta' : 'Falta'}
                            </Button>
                        </div>
                        {presencaStatus && (
                            <p className="mt-3 text-sm text-bat-yellow-500">
                                {presencaStatus === 'Presente' ? '✓ Presença marcada para ' : '✗ Falta registrada para '}
                                {new Date(dataPresenca).toLocaleDateString()}
                            </p>
                        )}
                    </Card>
                </section>

                <section>
                    <h2 className="mb-4 font-display text-2xl tracking-wide text-bat-yellow-500">Meus Treinos</h2>

                    {planos.length === 0 ? (
                        <p className="text-gotham-300">Nenhum plano de treino atribuído.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
                            <div>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gotham-300">Planos</h3>
                                <div className="space-y-2">
                                    {planos.map(p => {
                                        const isSelected = (selectedPlano?.id_planotreino || selectedPlano?.id) === (p.id_planotreino || p.id);
                                        return (
                                            <Card
                                                key={p.id_planotreino || p.id}
                                                onClick={() => {
                                                    setSelectedPlano(p);
                                                    loadExerciciosPlano(p.id_planotreino || p.id);
                                                }}
                                                className={cx(
                                                    'cursor-pointer p-3 transition-colors',
                                                    isSelected ? 'border-bat-yellow-500 bg-bat-yellow-500 text-gotham-950' : 'hover:border-gotham-500'
                                                )}
                                            >
                                                <div className="text-sm font-semibold">{p.nome}</div>
                                                {p.descricao && (
                                                    <div className={cx('mt-1 text-xs', isSelected ? 'text-gotham-900/80' : 'text-gotham-300')}>
                                                        {p.descricao}
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedPlano && (
                                <div>
                                    <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gotham-300">{selectedPlano.nome}</h3>
                                    {selectedPlano.descricao && (
                                        <p className="mb-4 text-sm text-gotham-300">{selectedPlano.descricao}</p>
                                    )}

                                    <h4 className="mb-3 font-display text-lg tracking-wide text-bat-yellow-500">Exercícios</h4>
                                    {exerciciosPlano.length === 0 ? (
                                        <p className="text-gotham-300">Sem exercícios neste plano.</p>
                                    ) : (
                                        <div className="grid gap-3">
                                            {exerciciosPlano.map((ex, idx) => (
                                                <Card key={idx} className="border-l-4 border-l-bat-yellow-500 p-4">
                                                    <div className="mb-2 flex items-center justify-between font-semibold text-bat-yellow-500">
                                                        <span>{idx + 1}. {ex.nome}</span>
                                                        {ex.url_video && (
                                                            <a
                                                                href={ex.url_video}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-full bg-bat-yellow-500 px-2.5 py-1 text-xs font-bold text-gotham-950 no-underline hover:bg-bat-yellow-400"
                                                            >
                                                                ▶ Ver Vídeo
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gotham-100">
                                                        <div><span className="text-gotham-300">Séries:</span> {ex.series}</div>
                                                        <div><span className="text-gotham-300">Repetições:</span> {ex.repeticoes}</div>
                                                        <div><span className="text-gotham-300">Carga:</span> {ex.carga} kg</div>
                                                        <div><span className="text-gotham-300">Descanso:</span> {formatarDescanso(ex.descanso)}</div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AlunoDashboard;
