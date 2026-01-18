import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');

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
      .select('id, status, requested_date_time, confirmed_date_time, rejection_reason, doctor_id, created_at')
      .eq('id', appointmentId)
      .eq('patient_id', userId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Get queue position if appointment is confirmed
    let queuePosition = null;
    let patientsBefore = 0;
    let estimatedWaitTime = null;

    if (appointment.status === 'confirmed' && appointment.confirmed_date_time) {
      const appointmentTime = new Date(appointment.confirmed_date_time);

      // Count patients before this appointment for the same doctor on the same day
      const { data: appointmentsBefore } = await supabase
        .from('appointments')
        .select('id, confirmed_date_time')
        .eq('doctor_id', appointment.doctor_id)
        .eq('status', 'confirmed')
        .lt('confirmed_date_time', appointmentTime.toISOString())
        .gte('confirmed_date_time', new Date(appointmentTime.setHours(0, 0, 0, 0)).toISOString());

      patientsBefore = appointmentsBefore?.length || 0;
      queuePosition = patientsBefore + 1;

      // Estimate wait time (30 minutes per patient + buffer)
      if (patientsBefore > 0) {
        const estimatedMinutes = patientsBefore * 30 + 15; // 30 min per patient + 15 min buffer
        estimatedWaitTime = {
          minutes: estimatedMinutes,
          hours: Math.floor(estimatedMinutes / 60),
          remainingMinutes: estimatedMinutes % 60
        };
      }
    }

    // Get doctor info
    const { data: doctor } = await supabase
      .from('users')
      .select('id, full_name, email, specialty')
      .eq('id', appointment.doctor_id)
      .single();

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,
          status: appointment.status,
          requestedDateTime: appointment.requested_date_time,
          confirmedDateTime: appointment.confirmed_date_time,
          rejectionReason: appointment.rejection_reason,
          createdAt: appointment.created_at
        },
        doctor,
        queuePosition,
        patientsBefore,
        estimatedWaitTime
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get appointment status error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
