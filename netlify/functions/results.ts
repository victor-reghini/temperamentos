import { createClient } from '@supabase/supabase-js';
import { TemperamentResultSchema } from '../../src/lib/validation';

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  queryStringParameters?: Record<string, string | undefined>;
}

const memoryStore = new Map<string, unknown>();

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

export async function handler(event: NetlifyEvent) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
  };

  if (event.httpMethod === 'GET') {
    const id = event.queryStringParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Parâmetro id é obrigatório.' }),
      };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('temperament_results')
        .select('payload')
        .eq('id', id)
        .single();

      if (!error && data?.payload) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ result: data.payload, source: 'supabase' }),
        };
      }
    }

    if (memoryStore.has(id)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ result: memoryStore.get(id), source: 'memory' }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Resultado não encontrado.' }),
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const raw = JSON.parse(event.body || '{}');
      const parsed = TemperamentResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          statusCode: 422,
          headers,
          body: JSON.stringify({
            error: 'Payload inválido segundo o esquema Zod.',
            issues: parsed.error.issues,
          }),
        };
      }

      const result = parsed.data;
      memoryStore.set(result.id, result);

      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('temperament_results').upsert(
          {
            id: result.id,
            dominant: result.dominant,
            secondary: result.secondary,
            composite_name: result.compositeName,
            modality: result.modality,
            payload: result,
            created_at: result.createdAt,
          },
          { onConflict: 'id' }
        );

        if (!error) {
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ id: result.id, saved: true, mode: 'supabase' }),
          };
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: result.id,
          saved: Boolean(supabase),
          mode: 'offline_fallback',
        }),
      };
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'JSON malformado na requisição.' }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido.' }),
  };
}

