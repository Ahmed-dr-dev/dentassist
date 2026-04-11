type BrevoRecipient = { email: string; name?: string };

export async function sendTransactionalEmail(params: {
  to: BrevoRecipient[];
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  console.log('[Brevo] BREVO_API_KEY present:', !!apiKey);
  console.log('[Brevo] BREVO_SENDER_EMAIL:', senderEmail ?? '(not set)');
  console.log('[Brevo] Sending to:', JSON.stringify(params.to));
  console.log('[Brevo] Subject:', params.subject);

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo is not configured (BREVO_API_KEY, BREVO_SENDER_EMAIL)');
  }

  const payload = {
    sender: {
      email: senderEmail,
      name: process.env.BREVO_SENDER_NAME || 'DentAssist',
    },
    to: params.to,
    subject: params.subject,
    htmlContent: params.html,
  };

  console.log('[Brevo] Payload:', JSON.stringify(payload, null, 2));

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  console.log('[Brevo] Response status:', res.status);
  console.log('[Brevo] Response body:', responseText);

  if (!res.ok) {
    throw new Error(`Brevo API error ${res.status}: ${responseText}`);
  }
}
