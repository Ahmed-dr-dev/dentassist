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

    const { appointmentId, rejectionReason, alternativeDates, suggestNearestDoctor, dentistName, dentistAddress, dentistPhone } = await request.json();

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
        { error: 'Only doctors can reject appointments' },
        { status: 403 }
      );
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, doctor_id, requested_date_time, status, patient_id')
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
        { error: 'Unauthorized to reject this appointment' },
        { status: 403 }
      );
    }

    if (appointment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Appointment is not pending' },
        { status: 400 }
      );
    }

    // Validate input based on rejection type
    if (!suggestNearestDoctor && (!alternativeDates || alternativeDates.length === 0)) {
      return NextResponse.json(
        { error: 'Please provide alternative dates' },
        { status: 400 }
      );
    }

    if (suggestNearestDoctor && (!dentistName || !dentistAddress || !dentistPhone)) {
      return NextResponse.json(
        { error: 'Please provide dentist information (name, address, phone)' },
        { status: 400 }
      );
    }

    // Update appointment status with rejection and alternatives
    const rejectionMessage = rejectionReason || 'Appointment rejected by doctor';
    const fullRejectionReason = suggestNearestDoctor 
      ? `${rejectionMessage} - Patient advised to contact nearest dentist: ${dentistName}`
      : `${rejectionMessage} - Alternative dates provided`;

    const updateData: any = {
      status: 'rejected',
      rejection_reason: fullRejectionReason
    };

    if (!suggestNearestDoctor && alternativeDates) {
      // Store alternative dates as array
      updateData.alternative_dates = alternativeDates;
      updateData.suggested_dentist_name = null;
      updateData.suggested_dentist_address = null;
      updateData.suggested_dentist_phone = null;
    } else if (suggestNearestDoctor) {
      // Store dentist information
      updateData.suggested_dentist_name = dentistName;
      updateData.suggested_dentist_address = dentistAddress;
      updateData.suggested_dentist_phone = dentistPhone;
      updateData.alternative_dates = null;
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select('id, status, rejection_reason, alternative_dates, suggested_dentist_name, suggested_dentist_address, suggested_dentist_phone')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to reject appointment: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Appointment rejected with alternatives provided',
        appointment: updatedAppointment
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reject with alternatives error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
