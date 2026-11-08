interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers?: Record<string, string | undefined>;
}

export async function handler(event: NetlifyEvent) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido.' }),
    };
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  // Fase 1 / Fallback: se STRIPE_SECRET_KEY não existir, mantém liberação simulada sem erros
  if (!stripeSecretKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        mode: 'demo',
        unlocked: true,
        message: 'Modo de Demonstração ativo (STRIPE_SECRET_KEY ausente).',
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}') as {
      resultId?: string;
      compositeName?: string;
      returnUrl?: string;
    };

    const origin =
      event.headers?.origin ||
      process.env.URL ||
      'http://localhost:5173';

    const successUrl = body.returnUrl
      ? `${body.returnUrl}${body.returnUrl.includes('?') ? '&' : '?'}unlocked=1`
      : `${origin}/results?unlocked=1`;
    const cancelUrl = body.returnUrl || `${origin}/results`;

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('line_items[0][price_data][currency]', 'brl');
    params.append('line_items[0][price_data][unit_amount]', '2990'); // R$ 29,90
    params.append(
      'line_items[0][price_data][product_data][name]',
      `Manual Neurofuncional Completo (${body.compositeName || 'TemperamentAxes'})`
    );
    params.append('line_items[0][quantity]', '1');
    if (body.resultId) {
      params.append('client_reference_id', body.resultId);
      params.append('metadata[resultId]', body.resultId);
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = (await stripeRes.json()) as { url?: string; error?: { message?: string } };
    if (!stripeRes.ok || !session.url) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: session.error?.message || 'Falha ao criar sessão na Stripe.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        mode: 'live',
        url: session.url,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : 'Erro interno ao iniciar checkout.',
      }),
    };
  }
}

