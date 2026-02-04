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

    const { appointmentId, action, rejectionReason, confirmedDateTime } = await request.json();

    if (!appointmentId || !action) {
      return NextResponse.json(
        { error: 'Appointment ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be accept or reject' },
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
        { error: 'Only doctors or assistants can update appointments' },
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
      .select('id, doctor_id, requested_date_time, status, confirmed_date_time')
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

    if (appointment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Appointment is not pending' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      // Check daily quota (30 patients per day)
      const targetDate = confirmedDateTime || appointment.requested_date_time;
      const dateStart = new Date(targetDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(targetDate);
      dateEnd.setHours(23, 59, 59, 999);

      // Count confirmed appointments for this doctor on this date
      const { data: confirmedAppointments, error: countError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('status', 'confirmed')
        .gte('confirmed_date_time', dateStart.toISOString())
        .lte('confirmed_date_time', dateEnd.toISOString())
        .neq('id', appointmentId);

      if (countError) {
        return NextResponse.json(
          { error: `Failed to check quota: ${countError.message}` },
          { status: 500 }
        );
      }

      const confirmedCount = confirmedAppointments?.length || 0;

      if (confirmedCount >= 30) {
        return NextResponse.json(
          { 
            error: 'Daily quota reached. Maximum 30 patients per day.',
            quotaReached: true,
            confirmedCount: confirmedCount
          },
          { status: 400 }
        );
      }

      // Accept appointment
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'confirmed',
          confirmed_date_time: confirmedDateTime || appointment.requested_date_time,
          rejection_reason: null
        })
        .eq('id', appointmentId)
        .select('id, status, confirmed_date_time')
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to accept appointment: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: 'Appointment accepted successfully',
          appointment: updatedAppointment,
          remainingQuota: 30 - confirmedCount - 1
        },
        { status: 200 }
      );
    } else {
      // Reject appointment
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason || 'Appointment rejected by doctor'
        })
        .eq('id', appointmentId)
        .select('id, status, rejection_reason')
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to reject appointment: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: 'Appointment rejected successfully',
          appointment: updatedAppointment
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
