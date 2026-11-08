import rawQuestions from '../data/temperamentQuestions.json';
import {
  type AxisKey,
  type AxisScore,
  type ComparisonInsight,
  type LikertValue,
  type QuizModality,
  type TemperamentKey,
  type TemperamentProportion,
  type TemperamentQuestion,
  type TemperamentResult,
} from '../types/temperament';
import { generateSecureTestId, QuizSubmissionSchema } from './validation';

export const QUESTIONS_BANK: TemperamentQuestion[] = rawQuestions as TemperamentQuestion[];

export const MODALITY_CONFIG: Record<
  QuizModality,
  {
    key: QuizModality;
    title: string;
    questionCount: number;
    durationLabel: string;
    precision: number;
    subtitle: string;
  }
> = {
  rapido: {
    key: 'rapido',
    title: 'Rápido',
    questionCount: 20,
    durationLabel: '~2-3 min',
    precision: 75,
    subtitle: 'Triagem direta do temperamento dominante e vetores primários.',
  },
  medio: {
    key: 'medio',
    title: 'Médio',
    questionCount: 40,
    durationLabel: '~5-6 min',
    precision: 90,
    subtitle: 'Equilíbrio psicométrico calibrado contra empates artificiais.',
  },
  completo: {
    key: 'completo',
    title: 'Completo',
    questionCount: 96,
    durationLabel: '~13-15 min',
    precision: 98,
    subtitle: 'Análise exaustiva incluindo respostas sob estresse e fadiga cognitiva.',
  },
};

export interface TemperamentMetadata {
  key: TemperamentKey;
  name: string;
  classicalHumor: string;
  qualities: string;
  neuroCorrelate: string;
  eysenckPole: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  borderColor: string;
  summary: string;
  neuroDynamics: string;
  stressTrigger: string;
  recoveryProtocol: string;
  workRhythm: string;
  strengths: string[];
  blindSpots: string[];
}

export const TEMPERAMENT_META: Record<TemperamentKey, TemperamentMetadata> = {
  colerico: {
    key: 'colerico',
    name: 'Colérico',
    classicalHumor: 'Bílis Amarela (Quente e Seco)',
    qualities: 'Quente + Seco',
    neuroCorrelate: 'Via Testosterona / Noradrenalina (Direcionamento e Comando)',
    eysenckPole: 'Extroversão + Alta Reatividade (Impulso Direcionado)',
    gradientFrom: '#d9776c',
    gradientTo: '#e08e6d',
    textColor: '#e29587',
    borderColor: '#d9776c',
    summary:
      'Orientado à execução rápida, autonomia decisória e transposição de obstáculos. Reage de imediato aos estímulos e mantém a marcação firme das metas escolhidas.',
    neuroDynamics:
      'Alta ativação dopaminérgica-noradrenérgica combinada com perfil assertivo-analítico do inventário de Fisher. Prioriza alvos tangíveis, velocidade de resposta e domínio sobre variáveis críticas.',
    stressTrigger:
      'Microgerenciamento, indecisão crônica do grupo, lentidão operacional e perda de autonomia sobre entregas pelas quais responde.',
    recoveryProtocol:
      'Descarga motora intensa, autonomia em blocos isolados de decisão e delegação estruturada com metas claras.',
    workRhythm:
      'Sprints de alta tração, tomada de decisão vertical e cobrança direta por indicadores de impacto.',
    strengths: [
      'Decisão rápida sob cenários de incerteza',
      'Capacidade de tração e mobilização de equipes',
      'Foco inabalável em metas mensuráveis',
      'Franqueza objetiva na resolução de gargalos',
    ],
    blindSpots: [
      'Baixa tolerância ao ritmo de perfis mais reflexivos',
      'Risco de atropelar nuances emocionais da equipe',
      'Dificuldade em delegar sem controlar o método',
    ],
  },
  sanguineo: {
    key: 'sanguineo',
    name: 'Sanguíneo',
    classicalHumor: 'Sangue (Quente e Úmido)',
    qualities: 'Quente + Úmido',
    neuroCorrelate: 'Via Dopamina (Exploração, Novidade e Plasticidade Social)',
    eysenckPole: 'Extroversão + Baixa Retenção (Adaptabilidade Rápida)',
    gradientFrom: '#dfc16b',
    gradientTo: '#cfa855',
    textColor: '#e4c97a',
    borderColor: '#dfc16b',
    summary:
      'Movido por curiosidade exploratória, presença comunicativa e alta plasticidade emocional. Conecta pessoas com facilidade e renova o foco diante de mudanças.',
    neuroDynamics:
      'Predomínio do sistema exploratório dopaminérgico descrito por Helen Fisher, aliado à extroversão social de Eysenck. Responde rápido ao ambiente, mas não retém cargas negativas por longo prazo.',
    stressTrigger:
      'Isolamento prolongado, rotinas burocráticas repetitivas, ambientes hostis e ausência de troca humana.',
    recoveryProtocol:
      'Interação social espontânea, mudança física de ambiente, variedade criativa e ciclos curtos de execução.',
    workRhythm:
      'Ideação colaborativa, articulação de redes, comunicação persuasiva e adaptação ágil a imprevistos.',
    strengths: [
      'Comunicação magnética e articulação interpessoal',
      'Criatividade espontânea e improviso sob mudança',
      'Desapego rápido de frustrações passadas',
      'Capacidade de elevar o moral coletivo',
    ],
    blindSpots: [
      'Dispersão em rotinas longas de documentação técnica',
      'Impulsividade verbal antes de filtrar detalhes',
      'Queda de energia na reta final de projetos monótonos',
    ],
  },
  melancolico: {
    key: 'melancolico',
    name: 'Melancólico',
    classicalHumor: 'Bílis Negra (Frio e Seco)',
    qualities: 'Frio + Seco',
    neuroCorrelate: 'Via Estrogênio / Sensibilidade Cortical (Profundidade e Síntese)',
    eysenckPole: 'Introversão + Alta Retenção (Processamento Profundo)',
    gradientFrom: '#6e98c4',
    gradientTo: '#5b82b0',
    textColor: '#8db1d6',
    borderColor: '#6e98c4',
    summary:
      'Guiado por análise exaustiva, sensibilidade estética/ética e retenção profunda de experiências. Pondera antes de agir, mas sustenta convicções e vínculos com rigor duradouro.',
    neuroDynamics:
      'Elevada ativação cortical reticulotalâmica (introversão de Eysenck) somada à empatia contextual e pensamento web-sistêmico de Fisher. Registra estímulos em alta resolução e antecipa riscos.',
    stressTrigger:
      'Improviso forçado sem dados, barulho constante, superficialidade técnica e quebra de compromissos éticos.',
    recoveryProtocol:
      'Silêncio ininterrupto, tempo prévio de preparação, ambientes ordenados e expressão escrita ou analítica.',
    workRhythm:
      'Planejamento arquitetural profundo, controle rigoroso de qualidade e prevenção antecipada de falhas.',
    strengths: [
      'Excelência analítica e detecção precoce de riscos',
      'Profundidade intelectual e rigor metodológico',
      'Lealdade duradoura a princípios e pessoas',
      'Autonomia para trabalho complexo em foco profundo',
    ],
    blindSpots: [
      'Paralisia por análise diante de prazos curtos',
      'Autocrítica severa e ruminação de falhas passadas',
      'Desgaste elevado em ambientes caóticos ou ruidosos',
    ],
  },
  fleumatico: {
    key: 'fleumatico',
    name: 'Fleumático',
    classicalHumor: 'Fleuma (Frio e Úmido)',
    qualities: 'Frio + Úmido',
    neuroCorrelate: 'Via Serotonina / GABA (Estabilidade, Constância e Harmonia)',
    eysenckPole: 'Introversão Estável (Baixo Neuroticismo e Ritmo Constante)',
    gradientFrom: '#6eb096',
    gradientTo: '#788c85',
    textColor: '#86c2aa',
    borderColor: '#6eb096',
    summary:
      'Sustentado por equilíbrio homeostático, escuta diplomática e constância de longo prazo. Absorve pressões externas sem perder a serenidade e preserva a coesão do grupo.',
    neuroDynamics:
      'Estabilidade autonômica (baixo neuroticismo no eixo PEN) associada à regulação serotoninérgica. Baixa reatividade impulsiva combinada com alta adaptabilidade pacífica.',
    stressTrigger:
      'Confrontos agressivos constantes, cobranças explosivas de última hora e ambientes politicamente hostis.',
    recoveryProtocol:
      'Previsibilidade de rotina, repouso físico tranquilo, ausência de conflito aberto e tempo gradual de transição.',
    workRhythm:
      'Cadência sustentável, mediação diplomática de conflitos e confiabilidade em processos contínuos.',
    strengths: [
      'Sangue-frio e regulação emocional em crises',
      'Mediação imparcial e escuta acolhedora',
      'Constância operacional em maratonas de longo prazo',
      'Baixo atrito interpessoal em equipes diversas',
    ],
    blindSpots: [
      'Tendência a adiar confrontos necessários pela paz',
      'Inércia inicial diante de mudanças radicais de rota',
      'Supressão silenciosa das próprias demandas sob pressão',
    ],
  },
};

export const AXES_META: Record<
  AxisKey,
  {
    key: AxisKey;
    label: string;
    leftPole: string;
    rightPole: string;
    leftColor: string;
    rightColor: string;
    description: string;
  }
> = {
  reatividade: {
    key: 'reatividade',
    label: 'Eixo 1: Reatividade',
    leftPole: 'Impulso Imediato',
    rightPole: 'Resposta Ponderada',
    leftColor: '#d9776c',
    rightColor: '#6e98c4',
    description:
      'Velocidade de ignição diante de estímulos, provocações e decisões críticas (Quente vs. Frio).',
  },
  foco_direcional: {
    key: 'foco_direcional',
    label: 'Eixo 2: Foco Direcional',
    leftPole: 'Resultados e Metas',
    rightPole: 'Conexões Humanas',
    leftColor: '#e08e6d',
    rightColor: '#dfc16b',
    description:
      'Critério prioritário de decisão: eficácia estrutural e verdade objetiva vs. harmonia e vínculo interpessoal.',
  },
  retencao_estimulo: {
    key: 'retencao_estimulo',
    label: 'Eixo 3: Retenção de Estímulo',
    leftPole: 'Marcação Profunda',
    rightPole: 'Volatilidade Adaptativa',
    leftColor: '#5b82b0',
    rightColor: '#6eb096',
    description:
      'Duração da impressão neuroquímica após eventos intensos: fixação duradoura (Seco) vs. desapego plástico (Úmido).',
  },
  ativacao_energetica: {
    key: 'ativacao_energetica',
    label: 'Eixo 4: Ativação Energética',
    leftPole: 'Expansão Externa',
    rightPole: 'Recarga Solitária',
    leftColor: '#cfa855',
    rightColor: '#788c85',
    description:
      'Fonte primária de recarga cortical (Extroversão vs. Introversão no modelo PEN de Eysenck).',
  },
};

export function getQuestionsForModality(modality: QuizModality): TemperamentQuestion[] {
  const count = MODALITY_CONFIG[modality].questionCount;
  // As primeiras `count` questões do banco foram geradas em ordem round-robin estrita (4 temperamentos x 4 eixos)
  return QUESTIONS_BANK.slice(0, count);
}

export function calculateTemperamentResult(
  modality: QuizModality,
  rawAnswers: Record<string | number, LikertValue>
): TemperamentResult {
  const normalizedAnswers: Record<string, LikertValue> = {};
  for (const [k, v] of Object.entries(rawAnswers)) {
    normalizedAnswers[String(k)] = v;
  }

  // Validação Zod estrita [-2, 2]
  const parsed = QuizSubmissionSchema.parse({
    modality,
    answers: normalizedAnswers,
  });

  const questions = getQuestionsForModality(parsed.modality);

  // Acumuladores por temperamento: cada resposta [-2..+2] é convertida para escala positiva [0..4]
  const tempRawSum: Record<TemperamentKey, number> = {
    colerico: 0,
    sanguineo: 0,
    melancolico: 0,
    fleumatico: 0,
  };
  const tempMaxPossible: Record<TemperamentKey, number> = {
    colerico: 0,
    sanguineo: 0,
    melancolico: 0,
    fleumatico: 0,
  };

  // Acumuladores por eixo: cada questão tem axisPolarity (+1 para polo esquerdo, -1 para polo direito)
  const axisSignedSum: Record<AxisKey, number> = {
    reatividade: 0,
    foco_direcional: 0,
    retencao_estimulo: 0,
    ativacao_energetica: 0,
  };
  const axisMaxAbs: Record<AxisKey, number> = {
    reatividade: 0,
    foco_direcional: 0,
    retencao_estimulo: 0,
    ativacao_energetica: 0,
  };

  for (const q of questions) {
    const ans = parsed.answers[String(q.id)] ?? 0;
    const weight = q.stressContext ? 1.15 : 1.0;

    // Afinidade ao temperamento (0 a 4 * weight)
    const shifted = (ans + 2) * weight;
    tempRawSum[q.temperament] += shifted;
    tempMaxPossible[q.temperament] += 4 * weight;

    // Contribuição ao eixo bipolar (-2 a +2 * polarity * weight)
    axisSignedSum[q.primaryAxis] += ans * q.axisPolarity * weight;
    axisMaxAbs[q.primaryAxis] += 2 * weight;
  }

  // Afinidades absolutas (0..100%)
  const affinities: Record<TemperamentKey, number> = {
    colerico: Math.round((tempRawSum.colerico / Math.max(1, tempMaxPossible.colerico)) * 100),
    sanguineo: Math.round((tempRawSum.sanguineo / Math.max(1, tempMaxPossible.sanguineo)) * 100),
    melancolico: Math.round((tempRawSum.melancolico / Math.max(1, tempMaxPossible.melancolico)) * 100),
    fleumatico: Math.round((tempRawSum.fleumatico / Math.max(1, tempMaxPossible.fleumatico)) * 100),
  };

  // Proporção relativa entre os 4 temperamentos (soma exata = 100%)
  const totalShifted =
    tempRawSum.colerico +
    tempRawSum.sanguineo +
    tempRawSum.melancolico +
    tempRawSum.fleumatico;

  let temperaments: Record<TemperamentKey, number>;
  if (totalShifted <= 0) {
    temperaments = { colerico: 25, sanguineo: 25, melancolico: 25, fleumatico: 25 };
  } else {
    const c = Math.round((tempRawSum.colerico / totalShifted) * 100);
    const s = Math.round((tempRawSum.sanguineo / totalShifted) * 100);
    const m = Math.round((tempRawSum.melancolico / totalShifted) * 100);
    const f = Math.max(0, 100 - (c + s + m));
    temperaments = { colerico: c, sanguineo: s, melancolico: m, fleumatico: f };
  }

  // Eixos bipolares (left + right = 100%)
  const axes: Record<AxisKey, { left: number; right: number }> = {
    reatividade: { left: 50, right: 50 },
    foco_direcional: { left: 50, right: 50 },
    retencao_estimulo: { left: 50, right: 50 },
    ativacao_energetica: { left: 50, right: 50 },
  };

  (Object.keys(axes) as AxisKey[]).forEach((axisKey) => {
    const maxVal = Math.max(1, axisMaxAbs[axisKey]);
    // Normaliza de [-maxVal, +maxVal] para [0, 100] no polo esquerdo
    const ratio = (axisSignedSum[axisKey] + maxVal) / (2 * maxVal);
    const left = Math.min(100, Math.max(0, Math.round(ratio * 100)));
    axes[axisKey] = { left, right: 100 - left };
  });

  // Ordena temperamentos para definir dominante e secundário (usando soma exata como critério de desempate)
  const ordered = (['colerico', 'sanguineo', 'melancolico', 'fleumatico'] as TemperamentKey[]).sort(
    (a, b) => {
      if (temperaments[b] !== temperaments[a]) return temperaments[b] - temperaments[a];
      return tempRawSum[b] - tempRawSum[a];
    }
  );

  const dominant = ordered[0];
  const secondary = ordered[1];
  const compositeName = `${TEMPERAMENT_META[dominant].name}-${TEMPERAMENT_META[secondary].name}`;

  // Coordenadas Eysenck PEN (0..100)
  const extroversao = Math.round(
    (axes.ativacao_energetica.left * 0.6 + axes.reatividade.left * 0.4)
  );
  const neuroticismo = Math.round(
    (axes.retencao_estimulo.left * 0.6 +
      (affinities.colerico + affinities.melancolico) * 0.2)
  );

  return {
    id: generateSecureTestId(),
    createdAt: new Date().toISOString(),
    modality: parsed.modality,
    questionCount: questions.length,
    precisionEstimate: MODALITY_CONFIG[parsed.modality].precision,
    dominant,
    secondary,
    compositeName,
    temperaments,
    affinities,
    axes,
    eysenck: {
      extroversao: Math.min(100, Math.max(0, extroversao)),
      neuroticismo: Math.min(100, Math.max(0, neuroticismo)),
    },
  };
}

export function getFormattedProportions(result: TemperamentResult): TemperamentProportion[] {
  const keys: TemperamentKey[] = ['colerico', 'sanguineo', 'melancolico', 'fleumatico'];
  return keys.map((k) => {
    const meta = TEMPERAMENT_META[k];
    return {
      key: k,
      name: meta.name,
      classicalElement: meta.qualities,
      neuroCorrelate: meta.neuroCorrelate,
      percentage: result.temperaments[k],
      affinityScore: result.affinities[k],
      gradientFrom: meta.gradientFrom,
      gradientTo: meta.gradientTo,
    };
  });
}

export function getFormattedAxes(result: TemperamentResult): AxisScore[] {
  const keys: AxisKey[] = [
    'reatividade',
    'foco_direcional',
    'retencao_estimulo',
    'ativacao_energetica',
  ];
  return keys.map((k) => {
    const meta = AXES_META[k];
    const pair = result.axes[k];
    const dominantPole =
      pair.left > pair.right
        ? meta.leftPole
        : pair.right > pair.left
          ? meta.rightPole
          : 'Equilíbrio Central';
    return {
      key: k,
      label: meta.label,
      leftPole: meta.leftPole,
      rightPole: meta.rightPole,
      leftPercent: pair.left,
      rightPercent: pair.right,
      dominantPole,
      description: meta.description,
    };
  });
}

export function compareTemperamentMatrices(
  first: TemperamentResult,
  second: TemperamentResult
): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];

  // 1. Eixo de Reatividade (Ritmo de resposta)
  const diffReatividade = Math.abs(first.axes.reatividade.left - second.axes.reatividade.left);
  if (diffReatividade >= 25) {
    insights.push({
      title: 'Assimetria de Velocidade Decisória (Reatividade)',
      category: 'ritmo',
      severity: diffReatividade >= 40 ? 'alta' : 'moderada',
      description: `Há uma diferença de ${diffReatividade} pontos percentuais no tempo de reação. Enquanto um perfil decide por impulso imediato, o outro exige maturação prévia dos dados.`,
      recommendation:
        'Separem reuniões de levantamento de problemas das reuniões de decisão final, dando ao perfil ponderado tempo de análise sem travar a tração do perfil rápido.',
    });
  } else {
    insights.push({
      title: 'Sincronia no Tempo de Resposta',
      category: 'sinergia',
      severity: 'baixa',
      description: `Ambos operam com velocidade de reação semelhante (diferença de apenas ${diffReatividade}%), reduzindo a sensação de pressa excessiva ou lentidão mútua.`,
      recommendation:
        'Cuidado apenas para não tomarem decisões impulsivas em dupla sem um revisor externo (se ambos forem rápidos) ou adiarem prazos críticos (se ambos forem ponderados).',
    });
  }

  // 2. Eixo de Foco Direcional (Metas vs Conexões)
  const diffFoco = Math.abs(first.axes.foco_direcional.left - second.axes.foco_direcional.left);
  if (diffFoco >= 22) {
    insights.push({
      title: 'Complementaridade Tarefa vs. Pessoas (Foco Direcional)',
      category: 'atrito',
      severity: diffFoco >= 38 ? 'alta' : 'moderada',
      description: `Divergência de ${diffFoco}% no critério central de decisão: um prioriza eficácia técnica e metas diretas, enquanto o outro protege o clima humano e a harmonia relacional.`,
      recommendation:
        'Em feedbacks de trabalho, alinhem primeiro o objetivo técnico comum para que a objetividade não soe como rispidez pessoal.',
    });
  } else {
    insights.push({
      title: 'Linguagem de Prioridade Alinhada',
      category: 'sinergia',
      severity: 'baixa',
      description: `Os dois perfis compartilham a mesma bússola decisória (${first.axes.foco_direcional.left >= 50 ? 'foco em metas e estrutura' : 'foco em pessoas e harmonia'}).`,
      recommendation:
        'Aproveitem a facilidade de comunicação direta, mas criem um checklist explícito para cobrir o polo oposto.',
    });
  }

  // 3. Eixo de Retenção de Estímulo (Memória Emocional)
  const diffRetencao = Math.abs(
    first.axes.retencao_estimulo.left - second.axes.retencao_estimulo.left
  );
  if (diffRetencao >= 22) {
    insights.push({
      title: 'Contraste de Memória Afetiva (Marcação vs. Volatilidade)',
      category: 'atrito',
      severity: diffRetencao >= 38 ? 'alta' : 'moderada',
      description: `Diferença de ${diffRetencao}% na retenção de estímulos. Um perfil vira a página rapidamente após discussões, enquanto o outro continua processando o impacto por dias.`,
      recommendation:
        'Quem tem baixa retenção deve evitar minimizar o impacto de palavras duras; quem tem alta retenção deve verbalizar o incômodo cedo em vez de acumular em silêncio.',
    });
  }

  // 4. Eixo de Ativação Energética (Gestão de Bateria)
  const diffEnergia = Math.abs(
    first.axes.ativacao_energetica.left - second.axes.ativacao_energetica.left
  );
  if (diffEnergia >= 22) {
    insights.push({
      title: 'Gestão de Bateria Social e Espaço de Trabalho',
      category: 'ritmo',
      severity: 'moderada',
      description: `Assimetria de ${diffEnergia}% na recarga energética: um perfil expande energia interagindo em voz alta, enquanto o outro precisa de isolamento acústico para produzir.`,
      recommendation:
        'Estabeleçam janelas livres de interrupção para trabalho focado e momentos dedicados para alinhamento verbal dinâmico.',
    });
  }

  return insights;
}
