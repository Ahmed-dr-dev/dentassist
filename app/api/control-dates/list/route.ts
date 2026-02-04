import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Only patients can view their control dates' },
        { status: 403 }
      );
    }

    const { data: controlDates, error } = await supabase
      .from('control_dates')
      .select(`
        id,
        control_date_time,
        notes,
        created_at,
        doctor:users!control_dates_doctor_id_fkey(id, full_name, specialty)
      `)
      .eq('patient_id', userId)
      .order('control_date_time', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch control dates: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { controlDates: controlDates || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error('Control dates list error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
