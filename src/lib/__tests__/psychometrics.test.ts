import { describe, expect, it } from 'vitest';
import {
  calculateTemperamentResult,
  compareTemperamentMatrices,
  getQuestionsForModality,
  QUESTIONS_BANK,
} from '../psychometrics';
import {
  decodeResultFromBase64,
  encodeResultToBase64,
  LikertValueSchema,
} from '../validation';
import { handler as resultsHandler } from '../../../netlify/functions/results';
import { handler as checkoutHandler } from '../../../netlify/functions/create-checkout-session';
import type { LikertValue } from '../../types/temperament';

describe('TemperamentAxes Psychometric Engine & Validation', () => {
  it('contains at least 150 balanced statements in temperamentQuestions.json', () => {
    expect(QUESTIONS_BANK.length).toBeGreaterThanOrEqual(150);

    const byTemp = { colerico: 0, sanguineo: 0, melancolico: 0, fleumatico: 0 };
    for (const q of QUESTIONS_BANK) {
      byTemp[q.temperament]++;
      expect(q.text).not.toContain('—');
    }

    expect(byTemp.colerico).toBe(40);
    expect(byTemp.sanguineo).toBe(40);
    expect(byTemp.melancolico).toBe(40);
    expect(byTemp.fleumatico).toBe(40);
  });

  it('validates Likert inputs strictly in [-2, 2] via Zod', () => {
    expect(LikertValueSchema.safeParse(-2).success).toBe(true);
    expect(LikertValueSchema.safeParse(0).success).toBe(true);
    expect(LikertValueSchema.safeParse(2).success).toBe(true);
    expect(LikertValueSchema.safeParse(-3).success).toBe(false);
    expect(LikertValueSchema.safeParse(3).success).toBe(false);
    expect(LikertValueSchema.safeParse(1.5).success).toBe(false);
  });

  it('computes accurate proportions and bipolar axes for Rapido (20), Medio (40), and Completo (96)', () => {
    for (const mod of ['rapido', 'medio', 'completo'] as const) {
      const qs = getQuestionsForModality(mod);
      const answers: Record<string, LikertValue> = {};
      for (const q of qs) {
        answers[String(q.id)] = q.temperament === 'colerico' ? 2 : q.temperament === 'melancolico' ? 1 : -1;
      }

      const res = calculateTemperamentResult(mod, answers);
      expect(res.dominant).toBe('colerico');
      expect(res.secondary).toBe('melancolico');
      expect(res.compositeName).toBe('Colérico-Melancólico');

      const sumPct =
        res.temperaments.colerico +
        res.temperaments.sanguineo +
        res.temperaments.melancolico +
        res.temperaments.fleumatico;
      expect(sumPct).toBe(100);

      expect(res.axes.reatividade.left + res.axes.reatividade.right).toBe(100);
      expect(res.axes.foco_direcional.left + res.axes.foco_direcional.right).toBe(100);
      expect(res.axes.retencao_estimulo.left + res.axes.retencao_estimulo.right).toBe(100);
      expect(res.axes.ativacao_energetica.left + res.axes.ativacao_energetica.right).toBe(100);

      // Roundtrip Base64 URL Hash
      const encoded = encodeResultToBase64(res);
      const decoded = decodeResultFromBase64(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(res.id);
      expect(decoded?.compositeName).toBe(res.compositeName);
    }
  });

  it('compares two temperament matrices and identifies rhythm/friction insights', () => {
    const qs = getQuestionsForModality('rapido');
    const ansA: Record<string, LikertValue> = {};
    const ansB: Record<string, LikertValue> = {};
    for (const q of qs) {
      ansA[String(q.id)] = q.temperament === 'colerico' ? 2 : -2;
      ansB[String(q.id)] = q.temperament === 'fleumatico' ? 2 : -2;
    }

    const resA = calculateTemperamentResult('rapido', ansA);
    const resB = calculateTemperamentResult('rapido', ansB);
    const insights = compareTemperamentMatrices(resA, resB);
    expect(insights.length).toBeGreaterThan(0);
  });

  it('handles Phase 1/2 /api/results and Phase 1/3 /api/create-checkout-session fault-tolerantly', async () => {
    const qs = getQuestionsForModality('rapido');
    const answers: Record<string, LikertValue> = {};
    for (const q of qs) answers[String(q.id)] = 1;
    const res = calculateTemperamentResult('rapido', answers);

    const postResp = await resultsHandler({
      httpMethod: 'POST',
      body: JSON.stringify(res),
    });
    expect(postResp.statusCode).toBe(200);

    const getResp = await resultsHandler({
      httpMethod: 'GET',
      body: null,
      queryStringParameters: { id: res.id },
    });
    expect(getResp.statusCode).toBe(200);

    const checkoutResp = await checkoutHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ resultId: res.id, compositeName: res.compositeName }),
    });
    expect(checkoutResp.statusCode).toBe(200);
    const checkoutData = JSON.parse(checkoutResp.body);
    expect(checkoutData.mode).toBe('demo');
    expect(checkoutData.unlocked).toBe(true);
  });
});
