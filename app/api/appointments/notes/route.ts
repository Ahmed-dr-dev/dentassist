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

    const { appointmentId, notes, observations } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is doctor
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Only doctors can add notes' },
        { status: 403 }
      );
    }

    // Get appointment details
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

    if (appointment.doctor_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this appointment' },
        { status: 403 }
      );
    }

    // Update notes
    const updateData: any = {};
    if (notes !== undefined) updateData.notes = notes;
    if (observations !== undefined) updateData.observations = observations;

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select('id, notes, observations')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update notes: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Notes updated successfully',
        appointment: updatedAppointment
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update notes error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
