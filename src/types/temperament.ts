export type TemperamentKey = 'colerico' | 'sanguineo' | 'melancolico' | 'fleumatico';

export type AxisKey =
  | 'reatividade'
  | 'foco_direcional'
  | 'retencao_estimulo'
  | 'ativacao_energetica';

export type NeuroSystemKey = 'testosterona' | 'dopamina' | 'estrogenio' | 'serotonina';

export type EysenckDimension =
  | 'extroversao_instavel'
  | 'extroversao_estavel'
  | 'introversao_instavel'
  | 'introversao_estavel';

export type QuizModality = 'rapido' | 'medio' | 'completo';

export type LikertValue = -2 | -1 | 0 | 1 | 2;

export interface QuestionExplanation {
  agree: string;
  agreeExample: string;
  disagree: string;
  disagreeExample: string;
  note: string;
}

export interface TemperamentQuestion {
  id: number;
  text: string;
  temperament: TemperamentKey;
  neuroSystem: NeuroSystemKey;
  eysenckDimension: EysenckDimension;
  primaryAxis: AxisKey;
  axisPolarity: 1 | -1;
  stressContext: boolean;
  tier: 'rapido' | 'medio' | 'completo' | 'banco';
  explanation: QuestionExplanation;
}

export interface AxisScore {
  key: AxisKey;
  label: string;
  leftPole: string;
  rightPole: string;
  leftPercent: number;  // 0..100
  rightPercent: number; // 0..100
  dominantPole: string;
  description: string;
}

export interface TemperamentProportion {
  key: TemperamentKey;
  name: string;
  classicalElement: string;
  neuroCorrelate: string;
  percentage: number;      // Proporção relativa (soma 100%)
  affinityScore: number;   // Intensidade absoluta na escala 0..100%
  gradientFrom: string;
  gradientTo: string;
}

export interface TemperamentResult {
  id: string;
  createdAt: string;
  modality: QuizModality;
  questionCount: number;
  precisionEstimate: number;
  dominant: TemperamentKey;
  secondary: TemperamentKey;
  compositeName: string;
  temperaments: Record<TemperamentKey, number>; // % individual (soma 100)
  affinities: Record<TemperamentKey, number>;   // % de afinidade absoluta 0..100
  axes: Record<AxisKey, { left: number; right: number }>;
  eysenck: {
    extroversao: number; // 0..100
    neuroticismo: number; // 0..100
  };
  unlockedPremium?: boolean;
}

export interface ComparisonInsight {
  title: string;
  category: 'sinergia' | 'atrito' | 'ritmo';
  severity: 'baixa' | 'moderada' | 'alta';
  description: string;
  recommendation: string;
}

