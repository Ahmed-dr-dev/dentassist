import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patientId, controlDateTime, notes, sourceAppointmentId } = body;

    if (!patientId || !controlDateTime) {
      return NextResponse.json(
        { error: 'Patient ID and control date/time are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'doctor' && user.role !== 'assistant')) {
      return NextResponse.json(
        { error: 'Only doctors or assistants can set control dates' },
        { status: 403 }
      );
    }

    let doctorId = userId;
    if (user.role === 'assistant') {
      const { data: doctor } = await supabase.from('users').select('id').eq('role', 'doctor').limit(1).single();
      if (!doctor) return NextResponse.json({ error: 'No doctor found' }, { status: 404 });
      doctorId = doctor.id;
    }

    const { data: row, error } = await supabase
      .from('control_dates')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        control_date_time: new Date(controlDateTime).toISOString(),
        notes: notes || null,
        source_appointment_id: sourceAppointmentId || null,
      })
      .select('id, control_date_time, notes, created_at')
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create control date: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Control date set successfully', controlDate: row },
      { status: 201 }
    );
  } catch (err) {
    console.error('Control date create error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
