type BrevoRecipient = { email: string; name?: string };

export async function sendTransactionalEmail(params: {
  to: BrevoRecipient[];
  subject: string;
  html: string;
  scheduledAt?: string; // ISO 8601 — omit to send immediately
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
  if (params.scheduledAt) console.log('[Brevo] Scheduled at:', params.scheduledAt);

  if (!apiKey) {
    console.error('[Brevo] FATAL: BREVO_API_KEY is missing');
    throw new Error('Brevo is not configured: missing BREVO_API_KEY');
  }
  if (!senderEmail) {
    console.error('[Brevo] FATAL: BREVO_SENDER_EMAIL is missing');
    throw new Error('Brevo is not configured: missing BREVO_SENDER_EMAIL');
  }

  const payload: Record<string, unknown> = {
    sender: { email: senderEmail, name: senderName },
    to: params.to,
    subject: params.subject,
    htmlContent: params.html,
  };

  if (params.scheduledAt) {
    payload.scheduledAt = params.scheduledAt;
  }

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

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function confirmationHtml(patientName: string, doctorName: string, appointmentIso: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
        <tr><td style="background:#2563eb;padding:28px 32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🦷 DentAssist</h1>
          <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px">Votre cabinet dentaire de confiance</p>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 8px;color:#1e3a5f;font-size:18px">Rendez-vous confirmé ✅</h2>
          <p style="margin:0 0 24px;color:#64748b;font-size:14px">Bonjour <strong>${patientName}</strong>,</p>
          <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6">
            Votre rendez-vous avec <strong>${doctorName}</strong> a bien été confirmé.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-left:4px solid #2563eb;border-radius:6px;padding:0">
            <tr><td style="padding:20px 24px">
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Date</p>
              <p style="margin:0 0 16px;color:#1e3a5f;font-size:16px;font-weight:600">${formatDate(appointmentIso)}</p>
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Heure</p>
              <p style="margin:0;color:#1e3a5f;font-size:16px;font-weight:600">${formatTime(appointmentIso)}</p>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#374151;font-size:14px;line-height:1.6">
            Vous recevrez un rappel 24 heures avant votre rendez-vous.<br>
            En cas d'empêchement, veuillez nous contacter dès que possible.
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">DentAssist — Cabinet dentaire · Gafsa, Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function reminderHtml(patientName: string, doctorName: string, appointmentIso: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
        <tr><td style="background:#f59e0b;padding:28px 32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🦷 DentAssist</h1>
          <p style="margin:6px 0 0;color:#fef3c7;font-size:13px">Rappel de rendez-vous</p>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 8px;color:#1e3a5f;font-size:18px">⏰ Rappel — demain vous avez rendez-vous</h2>
          <p style="margin:0 0 24px;color:#64748b;font-size:14px">Bonjour <strong>${patientName}</strong>,</p>
          <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6">
            Nous vous rappelons votre rendez-vous de <strong>demain</strong> avec <strong>${doctorName}</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;padding:0">
            <tr><td style="padding:20px 24px">
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Date</p>
              <p style="margin:0 0 16px;color:#1e3a5f;font-size:16px;font-weight:600">${formatDate(appointmentIso)}</p>
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Heure</p>
              <p style="margin:0;color:#1e3a5f;font-size:16px;font-weight:600">${formatTime(appointmentIso)}</p>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#374151;font-size:14px;line-height:1.6">
            Pensez à arriver 5 à 10 minutes avant l'heure prévue.<br>
            En cas d'empêchement, veuillez nous contacter dès que possible.
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">DentAssist — Cabinet dentaire · Gafsa, Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAppointmentConfirmation(params: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  appointmentIso: string;
}): Promise<void> {
  await sendTransactionalEmail({
    to: [{ email: params.patientEmail, name: params.patientName }],
    subject: `Confirmation de votre rendez-vous — ${formatDate(params.appointmentIso)} à ${formatTime(params.appointmentIso)}`,
    html: confirmationHtml(params.patientName, params.doctorName, params.appointmentIso),
  });
}

export async function scheduleAppointmentReminder(params: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  appointmentIso: string;
}): Promise<void> {
  const appointmentDate = new Date(params.appointmentIso);
  const reminderDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
  const now = new Date();

  if (reminderDate <= now) {
    console.log('[Brevo] Reminder skipped — appointment is less than 24h away');
    return;
  }

  await sendTransactionalEmail({
    to: [{ email: params.patientEmail, name: params.patientName }],
    subject: `Rappel: Votre rendez-vous demain à ${formatTime(params.appointmentIso)}`,
    html: reminderHtml(params.patientName, params.doctorName, params.appointmentIso),
    scheduledAt: reminderDate.toISOString(),
  });
}
