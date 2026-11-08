import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers?: Record<string, string | undefined>;
}

function verifyStripeSignature(payload: string, sigHeader: string, secret: string): boolean {
  const parts = sigHeader.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='));
  const signaturePart = parts.find((p) => p.startsWith('v1='));
  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.slice(2);
  const signature = signaturePart.slice(3);
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function handler(event: NetlifyEvent) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido.' }) };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = event.body || '';
  const sigHeader =
    event.headers?.['stripe-signature'] || event.headers?.['Stripe-Signature'] || '';

  if (webhookSecret) {
    const valid = verifyStripeSignature(rawBody, sigHeader, webhookSecret);
    if (!valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Assinatura do webhook inválida.' }),
      };
    }
  }

  try {
    const stripeEvent = JSON.parse(rawBody) as {
      type?: string;
      data?: {
        object?: {
          client_reference_id?: string;
          metadata?: { resultId?: string };
        };
      };
    };

    if (stripeEvent.type === 'checkout.session.completed') {
      const resultId =
        stripeEvent.data?.object?.client_reference_id ||
        stripeEvent.data?.object?.metadata?.resultId;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (resultId && supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: existing } = await supabase
          .from('temperament_results')
          .select('payload')
          .eq('id', resultId)
          .single();

        if (existing?.payload) {
          const updatedPayload = { ...existing.payload, unlockedPremium: true };
          await supabase
            .from('temperament_results')
            .update({ payload: updatedPayload, unlocked_premium: true })
            .eq('id', resultId);
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Payload de evento inválido.' }),
    };
  }
}

