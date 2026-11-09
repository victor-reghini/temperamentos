import type { LikertValue, QuizModality, TemperamentResult } from '../types/temperament';
import { decodeResultFromBase64, encodeResultToBase64, TemperamentResultSchema } from './validation';

const STORAGE_KEYS = {
  LATEST_RESULT: 'temperament_axes_latest_result_v1',
  RESULTS_BY_ID: 'temperament_axes_results_map_v1',
  PROGRESS: 'temperament_axes_quiz_progress_v1',
};

const memoryStore = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // fallback
  }
  return memoryStore.get(key) ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
  memoryStore.set(key, value);
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(key);
    }
  } catch {
    // fallback
  }
  memoryStore.delete(key);
}

export interface QuizProgressState {
  modality: QuizModality;
  currentIndex: number;
  answers: Record<string, LikertValue>;
  updatedAt: string;
}

export function isSupabaseConfigured(): boolean {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL);
}

export function isStripeConfigured(): boolean {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  return Boolean(
    env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      env.VITE_STRIPE_PUBLIC_KEY ||
      env.STRIPE_SECRET_KEY
  );
}

export function isResultPdfUnlocked(resultId: string): boolean {
  return safeGetItem(`temperament_unlocked_${resultId}`) === 'true';
}

export function unlockResultPdf(resultId: string): void {
  safeSetItem(`temperament_unlocked_${resultId}`, 'true');
}

export function saveQuizProgress(state: QuizProgressState): void {
  safeSetItem(STORAGE_KEYS.PROGRESS, JSON.stringify(state));
}

export function loadQuizProgress(): QuizProgressState | null {
  const raw = safeGetItem(STORAGE_KEYS.PROGRESS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuizProgressState;
  } catch {
    return null;
  }
}

export function clearQuizProgress(): void {
  safeRemoveItem(STORAGE_KEYS.PROGRESS);
}

export function saveResultLocally(result: TemperamentResult): void {
  safeSetItem(STORAGE_KEYS.LATEST_RESULT, JSON.stringify(result));
  const mapRaw = safeGetItem(STORAGE_KEYS.RESULTS_BY_ID);
  const map: Record<string, TemperamentResult> = mapRaw ? JSON.parse(mapRaw) : {};
  map[result.id] = result;
  safeSetItem(STORAGE_KEYS.RESULTS_BY_ID, JSON.stringify(map));
}

export function getLocalResultById(id: string): TemperamentResult | null {
  const mapRaw = safeGetItem(STORAGE_KEYS.RESULTS_BY_ID);
  if (mapRaw) {
    try {
      const map = JSON.parse(mapRaw) as Record<string, unknown>;
      if (map[id]) {
        const parsed = TemperamentResultSchema.safeParse(map[id]);
        if (parsed.success) return parsed.data as TemperamentResult;
      }
    } catch {
      // Ignora
    }
  }
  const latest = getLatestLocalResult();
  if (latest && latest.id === id) return latest;
  return null;
}

export function getLatestLocalResult(): TemperamentResult | null {
  const raw = safeGetItem(STORAGE_KEYS.LATEST_RESULT);
  if (!raw) return null;
  try {
    const parsed = TemperamentResultSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as TemperamentResult) : null;
  } catch {
    return null;
  }
}

// Fase 1 & Fase 2: Persiste resultado localmente e, se Supabase estiver configurado, salva em /api/results
export async function persistAndResolveRoute(result: TemperamentResult): Promise<{
  targetPath: string;
  hash: string;
  persistedRemote: boolean;
}> {
  saveResultLocally(result);
  const hash = encodeResultToBase64(result);

  if (isSupabaseConfigured()) {
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (response.ok) {
        const data = (await response.json()) as { id?: string; saved?: boolean };
        if (data.saved && data.id) {
          return {
            targetPath: `/r/${data.id}#scores=${hash}`,
            hash,
            persistedRemote: true,
          };
        }
      }
    } catch {
      // Fallback tolerante a falhas para Fase 1 (URL Hash + localStorage)
    }
  }

  return {
    targetPath: `/results#scores=${hash}`,
    hash,
    persistedRemote: false,
  };
}

export async function fetchResultByIdOrHash(params: {
  id?: string;
  hash?: string;
}): Promise<TemperamentResult | null> {
  if (params.hash) {
    const decoded = decodeResultFromBase64(params.hash);
    if (decoded) {
      saveResultLocally(decoded);
      return decoded;
    }
  }

  if (params.id) {
    const local = getLocalResultById(params.id);
    if (local) return local;

    try {
      const res = await fetch(`/api/results?id=${encodeURIComponent(params.id)}`);
      if (res.ok) {
        const payload = await res.json();
        const validated = TemperamentResultSchema.safeParse(payload.result ?? payload);
        if (validated.success) {
          const data = validated.data as TemperamentResult;
          saveResultLocally(data);
          return data;
        }
      }
    } catch {
      // Silencioso no modo offline
    }
  }

  return null;
}

