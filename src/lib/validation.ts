import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { TemperamentResult } from '../types/temperament';

// Validação estrita do valor Likert no intervalo [-2, 2]
export const LikertValueSchema = z
  .number()
  .int()
  .min(-2, { message: 'Valor mínimo permitido é -2 (Discordo Totalmente).' })
  .max(2, { message: 'Valor máximo permitido é 2 (Concordo Totalmente).' });

export const QuizAnswersMapSchema = z.record(
  z.string().regex(/^\d+$/, 'ID da questão deve ser numérico.'),
  LikertValueSchema
);

export const QuizSubmissionSchema = z.object({
  modality: z.enum(['rapido', 'medio', 'completo']),
  answers: QuizAnswersMapSchema,
});

export const TemperamentPercentagesSchema = z.object({
  colerico: z.number().min(0).max(100),
  sanguineo: z.number().min(0).max(100),
  melancolico: z.number().min(0).max(100),
  fleumatico: z.number().min(0).max(100),
});

export const AxisPairSchema = z.object({
  left: z.number().min(0).max(100),
  right: z.number().min(0).max(100),
});

export const TemperamentResultSchema = z.object({
  id: z.string().min(6).max(36),
  createdAt: z.string(),
  modality: z.enum(['rapido', 'medio', 'completo']),
  questionCount: z.number().int().min(1).max(200),
  precisionEstimate: z.number().min(50).max(100),
  dominant: z.enum(['colerico', 'sanguineo', 'melancolico', 'fleumatico']),
  secondary: z.enum(['colerico', 'sanguineo', 'melancolico', 'fleumatico']),
  compositeName: z.string().min(3),
  temperaments: TemperamentPercentagesSchema,
  affinities: TemperamentPercentagesSchema,
  axes: z.object({
    reatividade: AxisPairSchema,
    foco_direcional: AxisPairSchema,
    retencao_estimulo: AxisPairSchema,
    ativacao_energetica: AxisPairSchema,
  }),
  eysenck: z.object({
    extroversao: z.number().min(0).max(100),
    neuroticismo: z.number().min(0).max(100),
  }),
  unlockedPremium: z.boolean().optional(),
});

export function generateSecureTestId(): string {
  return nanoid(12);
}

// Codificação compacta e segura em Base64 URL-safe para #scores={hash} e /compare?data1={hash1}&data2={hash2}
export function encodeResultToBase64(result: TemperamentResult): string {
  const json = JSON.stringify(result);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeResultFromBase64(hash: string): TemperamentResult | null {
  try {
    const cleaned = hash.trim().replace(/^#?scores=/, '');
    const base64 = cleaned.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    const validated = TemperamentResultSchema.safeParse(parsed);
    return validated.success ? (validated.data as TemperamentResult) : null;
  } catch {
    return null;
  }
}

