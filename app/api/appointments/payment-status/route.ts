import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { appointmentId, paymentStatus } = await request.json();

    if (!appointmentId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Appointment ID and payment status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'paid', 'unpaid'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status. Must be: pending, paid, or unpaid' },
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
        { error: 'Only doctors or assistants can update payment status' },
        { status: 403 }
      );
    }

    let doctorId = userId;
    if (user.role === 'assistant') {
      const { data: doctor } = await supabase.from('users').select('id').eq('role', 'doctor').limit(1).single();
      if (!doctor) return NextResponse.json({ error: 'No doctor found' }, { status: 404 });
      doctorId = doctor.id;
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, doctor_id')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.doctor_id !== doctorId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this appointment' },
        { status: 403 }
      );
    }

    // Update payment status
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({ payment_status: paymentStatus })
      .eq('id', appointmentId)
      .select('id, payment_status')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update payment status: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Payment status updated successfully',
        appointment: updatedAppointment
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update payment status error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
