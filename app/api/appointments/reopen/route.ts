import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId } = await request.json();
    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: user } = await supabase.from('users').select('role').eq('id', userId).single();
    if (!user || (user.role !== 'doctor' && user.role !== 'assistant')) {
      return NextResponse.json({ error: 'Only doctors or assistants can reopen appointments' }, { status: 403 });
    }

    let doctorId = userId;
    if (user.role === 'assistant') {
      const { data: doctor } = await supabase.from('users').select('id').eq('role', 'doctor').limit(1).single();
      if (!doctor) return NextResponse.json({ error: 'No doctor found' }, { status: 404 });
      doctorId = doctor.id;
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, doctor_id, status')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    if (appointment.doctor_id !== doctorId) {
      return NextResponse.json({ error: 'Unauthorized to reopen this appointment' }, { status: 403 });
    }
    if (appointment.status !== 'completed') {
      return NextResponse.json({ error: 'Only completed appointments can be reopened' }, { status: 400 });
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointmentId)
      .select('id, status')
      .single();

    if (updateError) {
      return NextResponse.json({ error: `Failed to reopen: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Appointment reopened', appointment: updatedAppointment },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reopen appointment error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
