import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AXES_META,
  compareTemperamentMatrices,
  TEMPERAMENT_META,
} from '../lib/psychometrics';
import { fetchResultByIdOrHash, getLatestLocalResult } from '../lib/storage';
import { decodeResultFromBase64, encodeResultToBase64 } from '../lib/validation';
import type { AxisKey, TemperamentKey, TemperamentResult } from '../types/temperament';

// Perfis de referência para permitir comparação imediata caso o usuário ainda não tenha o link de um amigo
const REFERENCE_ARCHETYPES: Record<string, TemperamentResult> = {
  colerico_melancolico: {
    id: 'ref-col-mel',
    createdAt: '2026-01-01T00:00:00.000Z',
    modality: 'medio',
    questionCount: 40,
    precisionEstimate: 90,
    dominant: 'colerico',
    secondary: 'melancolico',
    compositeName: 'Colérico-Melancólico (Arquétipo Executor)',
    temperaments: { colerico: 42, sanguineo: 14, melancolico: 30, fleumatico: 14 },
    affinities: { colerico: 88, sanguineo: 35, melancolico: 68, fleumatico: 32 },
    axes: {
      reatividade: { left: 74, right: 26 },
      foco_direcional: { left: 82, right: 18 },
      retencao_estimulo: { left: 76, right: 24 },
      ativacao_energetica: { left: 62, right: 38 },
    },
    eysenck: { extroversao: 67, neuroticismo: 77 },
  },
  sanguineo_fleumatico: {
    id: 'ref-san-fle',
    createdAt: '2026-01-01T00:00:00.000Z',
    modality: 'medio',
    questionCount: 40,
    precisionEstimate: 90,
    dominant: 'sanguineo',
    secondary: 'fleumatico',
    compositeName: 'Sanguíneo-Fleumático (Arquétipo Articulador)',
    temperaments: { colerico: 15, sanguineo: 43, melancolico: 12, fleumatico: 30 },
    affinities: { colerico: 36, sanguineo: 86, melancolico: 28, fleumatico: 66 },
    axes: {
      reatividade: { left: 58, right: 42 },
      foco_direcional: { left: 22, right: 78 },
      retencao_estimulo: { left: 20, right: 80 },
      ativacao_energetica: { left: 68, right: 32 },
    },
    eysenck: { extroversao: 64, neuroticismo: 25 },
  },
  melancolico_fleumatico: {
    id: 'ref-mel-fle',
    createdAt: '2026-01-01T00:00:00.000Z',
    modality: 'medio',
    questionCount: 40,
    precisionEstimate: 90,
    dominant: 'melancolico',
    secondary: 'fleumatico',
    compositeName: 'Melancólico-Fleumático (Arquétipo Analítico)',
    temperaments: { colerico: 12, sanguineo: 13, melancolico: 44, fleumatico: 31 },
    affinities: { colerico: 28, sanguineo: 30, melancolico: 89, fleumatico: 68 },
    axes: {
      reatividade: { left: 20, right: 80 },
      foco_direcional: { left: 60, right: 40 },
      retencao_estimulo: { left: 68, right: 32 },
      ativacao_energetica: { left: 22, right: 78 },
    },
    eysenck: { extroversao: 21, neuroticismo: 64 },
  },
};

function extractHashFromInput(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('#scores=')) {
    return trimmed.split('#scores=')[1].split('&')[0];
  }
  if (trimmed.includes('data1=')) {
    return trimmed.split('data1=')[1].split('&')[0];
  }
  if (trimmed.includes('data2=')) {
    return trimmed.split('data2=')[1].split('&')[0];
  }
  return trimmed;
}

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [first, setFirst] = useState<TemperamentResult | null>(null);
  const [second, setSecond] = useState<TemperamentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [friendInput, setFriendInput] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadBoth() {
      setLoading(true);
      const id1 = searchParams.get('id1') || undefined;
      const id2 = searchParams.get('id2') || undefined;
      const data1 = searchParams.get('data1') || undefined;
      const data2 = searchParams.get('data2') || undefined;

      const res1 =
        (await fetchResultByIdOrHash({ id: id1, hash: data1 })) || getLatestLocalResult();
      const res2 = await fetchResultByIdOrHash({ id: id2, hash: data2 });

      if (active) {
        setFirst(res1);
        setSecond(res2 || REFERENCE_ARCHETYPES.sanguineo_fleumatico);
        setLoading(false);
      }
    }
    loadBoth();
    return () => {
      active = false;
    };
  }, [searchParams]);

  const handleApplyFriendHash = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const extracted = extractHashFromInput(friendInput);
    const decoded = decodeResultFromBase64(extracted);
    if (!decoded) {
      setInputError(
        'Não foi possível decodificar o link ou código informado. Cole a URL de resultado completa (#scores=...) do seu amigo.'
      );
      return;
    }
    setSecond(decoded);
    const d1 = first ? encodeResultToBase64(first) : '';
    setSearchParams(d1 ? { data1: d1, data2: extracted } : { data2: extracted });
  };

  const handleLoadArchetype = (key: string) => {
    const preset = REFERENCE_ARCHETYPES[key];
    if (preset) {
      setSecond(preset);
      setInputError(null);
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-10 text-center"
      >
        <p className="text-[#4a4c52] dark:text-[#969696] font-mono text-sm">
          Carregando matrizes para comparação...
        </p>
      </div>
    );
  }

  const profileA = first || REFERENCE_ARCHETYPES.colerico_melancolico;
  const profileB = second || REFERENCE_ARCHETYPES.sanguineo_fleumatico;
  const insights = compareTemperamentMatrices(profileA, profileB);

  const tempKeys: TemperamentKey[] = ['colerico', 'sanguineo', 'melancolico', 'fleumatico'];
  const axisKeys: AxisKey[] = [
    'reatividade',
    'foco_direcional',
    'retencao_estimulo',
    'ativacao_energetica',
  ];

  return (
    <div className="space-y-10">
      <section className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-[#8f681d] dark:text-[#dfc16b] font-semibold">
            MODO COMPARATIVO DE EQUIPE E AMIGOS
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#18191b] dark:text-[#ffffff]">
            Sobreposição de Matrizes Neurobiológicas
          </h1>
          <p className="text-sm sm:text-base text-[#4e5056] dark:text-[#969696]">
            Compare sua matriz com o link de um colega ou escolha um arquétipo de referência para mapear sinergias e potenciais atritos de ritmo.
          </p>
        </div>

        {/* Formulário para colar o link/hash do amigo */}
        <form onSubmit={handleApplyFriendHash} className="space-y-3">
          <label
            htmlFor="friend-hash-input"
            className="block text-xs font-mono uppercase text-[#4a4c52] dark:text-[#969696]"
          >
            Cole o link de resultado (#scores=...) ou hash Base64 da segunda pessoa:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="friend-hash-input"
              type="text"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              placeholder="Ex: https://.../#scores=eyJpZCI6..."
              className="flex-1 min-h-[44px] rounded-xl bg-[#f3f2ea] dark:bg-[#1e1e1e] border border-[#cfcdc2] dark:border-[#333333] px-4 py-2 text-sm text-[#18191b] dark:text-[#d4d4d4] placeholder:text-[#7c7a72] dark:placeholder:text-[#707070] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] font-bold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
            >
              Carregar Matriz Comparada
            </button>
          </div>
          {inputError && (
            <p role="alert" className="text-xs text-[#9e3b33] dark:text-[#f0a99e] font-medium">
              {inputError}
            </p>
          )}
        </form>

        {/* Seleção rápida de arquétipos de referência */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-[#52545a] dark:text-[#969696]">
            Ou testar contra arquétipo de referência:
          </span>
          {Object.entries(REFERENCE_ARCHETYPES).map(([k, arch]) => (
            <button
              key={k}
              type="button"
              onClick={() => handleLoadArchetype(k)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-mono border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c] ${
                profileB.id === arch.id
                  ? 'bg-[#78c6b5] text-[#0e241f] border-[#78c6b5] dark:bg-[#3d5f83] dark:text-[#ffffff] dark:border-[#4a729c] font-bold'
                  : 'bg-[#f3f2ea] dark:bg-[#1e1e1e] text-[#2c2e33] dark:text-[#d4d4d4] border-[#cfcdc2] dark:border-[#333333] hover:bg-[#e8e6dc] dark:hover:bg-[#282828]'
              }`}
            >
              {arch.compositeName.split(' (')[0]}
            </button>
          ))}
        </div>
      </section>

      {/* Cartões de Identificação dos 2 Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#faf9f4] dark:bg-[#252526] border-2 border-[#cfa855]/70 rounded-2xl p-5 space-y-1">
          <span className="font-mono text-xs uppercase text-[#8f681d] dark:text-[#dfc16b] font-bold">
            PERFIL A {first ? '(Sua Matriz)' : '(Exemplo Inicial)'}
          </span>
          <h2 className="text-xl font-extrabold text-[#18191b] dark:text-[#ffffff]">
            {profileA.compositeName}
          </h2>
          <p className="text-xs font-mono text-[#52545a] dark:text-[#969696]">
            ID #{profileA.id} • Extroversão {profileA.eysenck.extroversao}% • Sensibilidade {profileA.eysenck.neuroticismo}%
          </p>
        </div>

        <div className="bg-[#faf9f4] dark:bg-[#252526] border-2 border-[#6e98c4]/70 rounded-2xl p-5 space-y-1">
          <span className="font-mono text-xs uppercase text-[#365f8a] dark:text-[#8eb2d9] font-bold">
            PERFIL B (Matriz Comparada)
          </span>
          <h2 className="text-xl font-extrabold text-[#18191b] dark:text-[#ffffff]">
            {profileB.compositeName}
          </h2>
          <p className="text-xs font-mono text-[#52545a] dark:text-[#969696]">
            ID #{profileB.id} • Extroversão {profileB.eysenck.extroversao}% • Sensibilidade {profileB.eysenck.neuroticismo}%
          </p>
        </div>
      </div>

      {/* Sobreposição das 4 Barras de Temperamento */}
      <section className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#18191b] dark:text-[#ffffff]">
          Comparativo Direto dos 4 Temperamentos
        </h2>
        <div className="space-y-6">
          {tempKeys.map((tKey) => {
            const meta = TEMPERAMENT_META[tKey];
            const valA = profileA.temperaments[tKey];
            const valB = profileB.temperaments[tKey];
            const delta = Math.abs(valA - valB);

            return (
              <div key={tKey} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-[#18191b] dark:text-[#ecebe6]">
                    {meta.name}{' '}
                    <span className="text-xs font-mono text-[#52545a] dark:text-[#a8a6a0]">
                      ({meta.qualities})
                    </span>
                  </span>
                  <span className="font-mono text-xs text-[#52545a] dark:text-[#a8a6a0] tabular-nums">
                    Diferença: {delta}%
                  </span>
                </div>

                {/* Barra Perfil A */}
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs font-mono text-[#8f681d] dark:text-[#dfc16b] font-bold">
                    Perfil A
                  </span>
                  <div className="flex-1 h-6 bg-[#e9e7de] dark:bg-[#1e1e1e] rounded overflow-hidden border border-[#d4d2c7] dark:border-[#2d2d2d]">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.max(2, valA)}%`,
                        backgroundImage: `linear-gradient(90deg, ${meta.gradientFrom}, ${meta.gradientTo})`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-xs font-bold text-[#18191b] dark:text-[#ecebe6] tabular-nums">
                    {valA}%
                  </span>
                </div>

                {/* Barra Perfil B */}
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs font-mono text-[#365f8a] dark:text-[#8eb2d9] font-bold">
                    Perfil B
                  </span>
                  <div className="flex-1 h-6 bg-[#e9e7de] dark:bg-[#1e1e1e] rounded overflow-hidden border border-[#d4d2c7] dark:border-[#2d2d2d]">
                    <div
                      className="h-full opacity-85"
                      style={{
                        width: `${Math.max(2, valB)}%`,
                        backgroundImage: `linear-gradient(90deg, ${meta.gradientFrom}, ${meta.gradientTo})`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-xs font-bold text-[#18191b] dark:text-[#ecebe6] tabular-nums">
                    {valB}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sobreposição dos 4 Eixos Neurobiológicos */}
      <section className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#18191b] dark:text-[#ffffff]">
          Comparativo nos 4 Eixos Neurobiológicos
        </h2>
        <div className="space-y-6">
          {axisKeys.map((aKey) => {
            const meta = AXES_META[aKey];
            const leftA = profileA.axes[aKey].left;
            const leftB = profileB.axes[aKey].left;

            return (
              <div
                key={aKey}
                className="bg-[#f3f2ea] dark:bg-[#181817] border border-[#dcdad0] dark:border-[#2a2a28] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#2c2e33] dark:text-[#dad8d0] font-bold">{meta.leftPole}</span>
                  <span className="text-[#6e5623] dark:text-[#dfc16b] uppercase">{meta.label}</span>
                  <span className="text-[#2c2e33] dark:text-[#dad8d0] font-bold">{meta.rightPole}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-16 text-[#8f681d] dark:text-[#dfc16b] font-bold">Perfil A</span>
                    <div className="relative flex-1 h-5 bg-[#e5e3d9] dark:bg-[#141413] rounded overflow-hidden flex">
                      <div style={{ width: `${leftA}%`, backgroundColor: meta.leftColor }} />
                      <div style={{ width: `${100 - leftA}%`, backgroundColor: meta.rightColor }} />
                      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#18191b] dark:bg-[#ecebe6]" />
                    </div>
                    <span className="w-20 text-right text-[#2c2e33] dark:text-[#dad8d0] tabular-nums">
                      {leftA}% / {100 - leftA}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-16 text-[#365f8a] dark:text-[#8eb2d9] font-bold">Perfil B</span>
                    <div className="relative flex-1 h-5 bg-[#e5e3d9] dark:bg-[#141413] rounded overflow-hidden flex">
                      <div style={{ width: `${leftB}%`, backgroundColor: meta.leftColor }} />
                      <div style={{ width: `${100 - leftB}%`, backgroundColor: meta.rightColor }} />
                      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#18191b] dark:bg-[#ecebe6]" />
                    </div>
                    <span className="w-20 text-right text-[#2c2e33] dark:text-[#dad8d0] tabular-nums">
                      {leftB}% / {100 - leftB}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Diagnóstico de Sinergias, Ritmo de Trabalho e Potenciais Atritos */}
      <section className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-[#18191b] dark:text-[#ffffff]">
          Diagnóstico de Convivência e Ritmo de Trabalho
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f3f2ea] dark:bg-[#181817] border border-[#dcdad0] dark:border-[#2a2a28] rounded-xl p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded bg-[#e8e6dc] dark:bg-[#252523] text-[#6e5623] dark:text-[#dfc16b] border border-[#cfcdc2] dark:border-[#383835] font-bold">
                  {item.category}
                </span>
                <span className="font-mono text-xs text-[#52545a] dark:text-[#a8a6a0]">
                  Intensidade: <strong className="text-[#18191b] dark:text-[#ecebe6]">{item.severity}</strong>
                </span>
              </div>
              <h3 className="text-base font-bold text-[#18191b] dark:text-[#ecebe6]">{item.title}</h3>
              <p className="text-sm text-[#4a4c52] dark:text-[#b5b3ad] leading-relaxed">
                {item.description}
              </p>
              <p className="text-xs text-[#23533d] dark:text-[#8ecbb0] bg-[#e6efe9] dark:bg-[#1f2924] border border-[#b8d4c5] dark:border-[#32473d] rounded-lg p-3 leading-relaxed">
                <strong className="text-[#183a2b] dark:text-[#a8dec5]">Protocolo Prático: </strong>
                {item.recommendation}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
