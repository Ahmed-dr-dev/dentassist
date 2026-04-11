import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { createClient } from '@/app/utils/supabase/server';
import { sendTransactionalEmail } from '@/lib/brevo';

const TOKEN_BYTES = 32;
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log('[forgot-password] Received request for email:', email);

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      console.log('[forgot-password] Invalid email format:', normalized);
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .ilike('email', normalized)
      .maybeSingle();

    console.log('[forgot-password] User lookup result:', user ? `found id=${user.id}` : 'not found');
    if (userError) console.error('[forgot-password] User lookup error:', userError);

    const okBody = {
      message:
        'If an account exists for this email, you will receive reset instructions shortly.',
    };

    if (!user) {
      console.log('[forgot-password] No user found — returning generic ok');
      return NextResponse.json(okBody, { status: 200 });
    }

    const { error: deleteError } = await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', user.id);
    if (deleteError) console.error('[forgot-password] Token delete error:', deleteError);

    const rawToken = randomBytes(TOKEN_BYTES).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + EXPIRY_MS).toISOString();

    console.log('[forgot-password] Inserting token, expires_at:', expiresAt);

    const { error: insertError } = await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('[forgot-password] Token insert error:', insertError);
      return NextResponse.json(okBody, { status: 200 });
    }

    console.log('[forgot-password] Token inserted successfully');

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
    console.log('[forgot-password] Reset URL:', resetUrl);

    const displayName =
      typeof user.full_name === 'string' && user.full_name.trim()
        ? user.full_name.trim()
        : 'there';

    const html = `
      <p>Hello ${escapeHtml(displayName)},</p>
      <p>You requested a password reset for your DentAssist account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in one hour. If you did not request this, you can ignore this email.</p>
    `;

    try {
      console.log('[forgot-password] Calling sendTransactionalEmail...');
      await sendTransactionalEmail({
        to: [{ email: user.email, name: displayName !== 'there' ? displayName : undefined }],
        subject: 'Reset your DentAssist password',
        html,
      });
      console.log('[forgot-password] Email sent successfully');
    } catch (e) {
      console.error('[forgot-password] Email send failed:', e);
    }

    return NextResponse.json(okBody, { status: 200 });
  } catch (error) {
    console.error('[forgot-password] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
