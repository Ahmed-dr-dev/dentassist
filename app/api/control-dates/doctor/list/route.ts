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

    // Verify user is doctor or assistant
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'doctor' && user.role !== 'assistant')) {
      return NextResponse.json(
        { error: 'Only doctors or assistants can view control dates' },
        { status: 403 }
      );
    }

    // Assistant sees the default doctor's control dates; doctor uses own id
    let doctorId = userId;
    if (user.role === 'assistant') {
      const { data: doctor } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'doctor')
        .limit(1)
        .single();
      if (!doctor) {
        return NextResponse.json(
          { error: 'No doctor found' },
          { status: 404 }
        );
      }
      doctorId = doctor.id;
    }

    const { data: controlDates, error } = await supabase
      .from('control_dates')
      .select(`
        id,
        control_date_time,
        notes,
        created_at,
        patient:users!control_dates_patient_id_fkey(id, full_name, email, phone)
      `)
      .eq('doctor_id', doctorId)
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
    console.error('Doctor control dates list error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

