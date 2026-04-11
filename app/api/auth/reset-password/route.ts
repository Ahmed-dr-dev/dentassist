import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createClient } from '@/app/utils/supabase/server';
import bcrypt from 'bcryptjs';

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token.trim());
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const { data: row, error: fetchError } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id')
      .eq('token_hash', tokenHash)
      .gt('expires_at', nowIso)
      .maybeSingle();

    if (fetchError || !row) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', row.user_id);

    if (updateError) {
      console.error('reset-password user update:', updateError);
      return NextResponse.json(
        { error: 'Could not update password' },
        { status: 500 }
      );
    }

    await supabase.from('password_reset_tokens').delete().eq('user_id', row.user_id);

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset-password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
