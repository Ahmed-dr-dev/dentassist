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

    const { appointmentId, reason } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, patient_id, status, confirmed_date_time')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify user is the patient who owns this appointment
    if (appointment.patient_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this appointment' },
        { status: 403 }
      );
    }

    // Can only cancel confirmed or pending appointments
    if (appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'rejected') {
      return NextResponse.json(
        { error: 'Cannot cancel this appointment' },
        { status: 400 }
      );
    }

    // Update appointment status
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelled by patient'
      })
      .eq('id', appointmentId)
      .select('id, status, cancellation_reason')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to cancel appointment: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Appointment cancelled successfully',
        appointment: updatedAppointment
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
