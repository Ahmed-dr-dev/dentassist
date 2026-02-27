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

    const { alternativeDateTime, reason, medicalHistory, currentMedications } = await request.json();

    if (!alternativeDateTime) {
      return NextResponse.json(
        { error: 'Alternative date time is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the default doctor (first doctor in database - this is a single dentist clinic)
    const { data: doctor } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'doctor')
      .limit(1)
      .single();

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctorId = doctor.id;

    // Check for conflicts: slot is taken if any appointment (pending or confirmed) uses it
    const slotStart = new Date(new Date(alternativeDateTime).getTime() - 30 * 60000).toISOString();
    const slotEnd = new Date(new Date(alternativeDateTime).getTime() + 30 * 60000).toISOString();

    const { data: conflictConfirmed } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .in('status', ['confirmed', 'completed'])
      .gte('confirmed_date_time', slotStart)
      .lte('confirmed_date_time', slotEnd);

    const { data: conflictPending } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('status', 'pending')
      .gte('requested_date_time', slotStart)
      .lte('requested_date_time', slotEnd);

    if ((conflictConfirmed?.length ?? 0) > 0 || (conflictPending?.length ?? 0) > 0) {
      return NextResponse.json(
        { error: 'Selected time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create appointment with alternative time
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: userId,
        doctor_id: doctorId,
        requested_date_time: alternativeDateTime,
        confirmed_date_time: alternativeDateTime,
        status: 'confirmed',
        reason: reason || null,
        medical_history: medicalHistory || null,
        current_medications: currentMedications || null
      })
      .select('id, status, confirmed_date_time, created_at')
      .single();

    if (appointmentError) {
      return NextResponse.json(
        { error: `Failed to create appointment: ${appointmentError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Appointment confirmed successfully',
        appointment
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Confirm alternative appointment error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
