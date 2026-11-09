import crypto from 'node:crypto';

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
}

export function generateUnlockSignature(secretKey: string, resultId: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(`temperament:${resultId}:paid`)
    .digest('hex');
}

export async function handler(event: NetlifyEvent) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
  };

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido.' }),
    };
  }

  const query = event.queryStringParameters || {};
  let body: { sessionId?: string; resultId?: string; token?: string } = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      // Ignora erro de parse
    }
  }

  const sessionId = body.sessionId || query.session_id || query.sessionId;
  const resultId = body.resultId || query.result_id || query.resultId;
  const token = body.token || query.token;

  if (!resultId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ unlocked: false, error: 'Identificador do resultado ausente.' }),
    };
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  // Fallback para desenvolvimento sem chaves Stripe configuradas
  if (!stripeSecretKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        unlocked: true,
        mode: 'demo',
        token: 'demo-token',
        message: 'Modo de demonstração (STRIPE_SECRET_KEY ausente).',
      }),
    };
  }

  // 1. Validação por token HMAC criptográfico previamente emitido
  if (token) {
    const expectedSig = generateUnlockSignature(stripeSecretKey, resultId);
    const tokenBuf = Buffer.from(token, 'utf-8');
    const expectedBuf = Buffer.from(expectedSig, 'utf-8');

    if (tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ unlocked: true, verified: true, token }),
      };
    }

    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        unlocked: false,
        error: 'Assinatura criptográfica de desbloqueio inválida.',
      }),
    };
  }

  // 2. Validação direta consultando a API da Stripe com o ID da sessão
  if (!sessionId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        unlocked: false,
        error: 'Sessão da Stripe ou token não informado.',
      }),
    };
  }

  try {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!stripeRes.ok) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          unlocked: false,
          error: 'Sessão de pagamento não localizada na Stripe.',
        }),
      };
    }

    const session = (await stripeRes.json()) as {
      payment_status?: string;
      status?: string;
      client_reference_id?: string;
      metadata?: { resultId?: string };
    };

    const isPaid = session.payment_status === 'paid' || session.status === 'complete';
    const matchesResult =
      session.client_reference_id === resultId ||
      session.metadata?.resultId === resultId;

    if (!isPaid) {
      return {
        statusCode: 402,
        headers,
        body: JSON.stringify({
          unlocked: false,
          error: 'Pagamento pendente na Stripe.',
          paymentStatus: session.payment_status,
        }),
      };
    }

    if (!matchesResult) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          unlocked: false,
          error: 'Esta sessão de pagamento pertence a outro resultado psicométrico.',
        }),
      };
    }

    // Pagamento confirmado na Stripe: gera assinatura criptográfica HMAC SHA-256
    const signature = generateUnlockSignature(stripeSecretKey, resultId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        unlocked: true,
        verified: true,
        token: signature,
        message: 'Pagamento confirmado e autenticado na Stripe.',
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        unlocked: false,
        error: err instanceof Error ? err.message : 'Falha ao consultar a Stripe.',
      }),
    };
  }
}

