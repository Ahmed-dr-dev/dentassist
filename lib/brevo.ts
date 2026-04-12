type BrevoRecipient = { email: string; name?: string };

export async function sendTransactionalEmail(params: {
  to: BrevoRecipient[];
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'DentAssist';

  console.log('[Brevo] ── env check ──────────────────────────');
  console.log('[Brevo] BREVO_API_KEY present:', !!apiKey);
  console.log('[Brevo] BREVO_API_KEY prefix:', apiKey ? apiKey.slice(0, 12) + '...' : '(not set)');
  console.log('[Brevo] BREVO_SENDER_EMAIL:', senderEmail ?? '(not set)');
  console.log('[Brevo] BREVO_SENDER_NAME:', senderName);
  console.log('[Brevo] ── request ──────────────────────────');
  console.log('[Brevo] Recipients:', JSON.stringify(params.to));
  console.log('[Brevo] Subject:', params.subject);

  if (!apiKey) {
    console.error('[Brevo] FATAL: BREVO_API_KEY is missing');
    throw new Error('Brevo is not configured: missing BREVO_API_KEY');
  }
  if (!senderEmail) {
    console.error('[Brevo] FATAL: BREVO_SENDER_EMAIL is missing');
    throw new Error('Brevo is not configured: missing BREVO_SENDER_EMAIL');
  }

  const payload = {
    sender: { email: senderEmail, name: senderName },
    to: params.to,
    subject: params.subject,
    htmlContent: params.html,
  };

  console.log('[Brevo] Full payload:', JSON.stringify(payload, null, 2));
  console.log('[Brevo] Calling https://api.brevo.com/v3/smtp/email ...');

  let res: Response;
  try {
    res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    console.error('[Brevo] Network error — could not reach Brevo API:', networkErr);
    throw networkErr;
  }

  const responseText = await res.text();
  console.log('[Brevo] ── response ─────────────────────────');
  console.log('[Brevo] Status:', res.status, res.statusText);
  console.log('[Brevo] Body:', responseText);

  const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
  const rateLimitReset = res.headers.get('x-ratelimit-reset');
  if (rateLimitRemaining !== null) {
    console.log('[Brevo] Rate-limit remaining:', rateLimitRemaining, '| resets at:', rateLimitReset);
  }

  if (!res.ok) {
    console.error(`[Brevo] API rejected the request — status ${res.status}:`, responseText);
    throw new Error(`Brevo API error ${res.status}: ${responseText}`);
  }

  console.log('[Brevo] ✓ Email queued successfully');
}
