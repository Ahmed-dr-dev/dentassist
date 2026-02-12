import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tariffs')
      .select('id, key, price, updated_at')
      .order('key');

    if (error) {
      console.error('Tariffs fetch error:', error);
      return NextResponse.json({ error: 'Failed to load tariffs' }, { status: 500 });
    }
    return NextResponse.json({ tariffs: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load tariffs' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'doctor' && user.role !== 'assistant')) {
      return NextResponse.json(
        { error: 'Only doctors or assistants can update tariffs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tariffs } = body as { tariffs: { key: string; price: number }[] };
    if (!Array.isArray(tariffs) || tariffs.length === 0) {
      return NextResponse.json(
        { error: 'tariffs array is required' },
        { status: 400 }
      );
    }

    for (const row of tariffs) {
      if (typeof row.key !== 'string' || typeof row.price !== 'number' || row.price < 0) {
        return NextResponse.json(
          { error: 'Each tariff must have key (string) and price (number >= 0)' },
          { status: 400 }
        );
      }
    }

    const rows = tariffs.map((row) => {
      const key = row.key.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || row.key.trim();
      return { key, price: row.price, updated_at: new Date().toISOString() };
    }).filter((r) => r.key.length > 0);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid tariffs to save' }, { status: 400 });
    }

    const { error: upsertError } = await supabase
      .from('tariffs')
      .upsert(rows, { onConflict: 'key' });

    if (upsertError) {
      console.error('Tariffs upsert error:', upsertError);
      return NextResponse.json(
        { error: upsertError.message || 'Failed to save tariffs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Tariffs updated successfully' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update tariffs' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'doctor' && user.role !== 'assistant')) {
      return NextResponse.json(
        { error: 'Only doctors or assistants can manage tariffs' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { key } = body as { key?: string };
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('tariffs')
      .delete()
      .eq('key', key.trim());

    if (deleteError) {
      console.error('Tariff delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete tariff' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Tariff deleted' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete tariff' }, { status: 500 });
  }
}
