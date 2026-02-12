import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: patientId } = await params;

    const supabase = await createClient();

    // Verify user is doctor or assistant
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'doctor' && user.role !== 'assistant')) {
      return NextResponse.json(
        { error: 'Only doctors or assistants can view patient details' },
        { status: 403 }
      );
    }

    // Assistant uses default doctor id for filtering appointments
    let doctorId = userId;
    if (user.role === 'assistant') {
      const { data: doctor } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'doctor')
        .limit(1)
        .single();
      if (doctor) doctorId = doctor.id;
    }

    // Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, created_at')
      .eq('id', patientId)
      .eq('role', 'patient')
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get all appointments for this patient with this doctor
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        requested_date_time,
        confirmed_date_time,
        reason,
        rejection_reason,
        cancellation_reason,
        notes,
        observations,
        payment_status,
        created_at,
        updated_at
      `)
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .order('confirmed_date_time', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (appointmentsError) {
      return NextResponse.json(
        { error: `Failed to fetch appointments: ${appointmentsError.message}` },
        { status: 500 }
      );
    }

    // Get prescriptions for this patient
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('id, file_path, file_name, description, created_at, appointment_id')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (prescriptionsError) {
      console.error('Error fetching prescriptions:', prescriptionsError);
    }

    // Get control dates for this patient (set by this doctor)
    let controlDates: any[] = [];
    const { data: controlDatesData, error: controlDatesError } = await supabase
      .from('control_dates')
      .select('id, control_date_time, notes, created_at')
      .eq('patient_id', patientId)
      .eq('doctor_id', doctorId)
      .order('control_date_time', { ascending: true });

    if (!controlDatesError && controlDatesData) {
      controlDates = controlDatesData;
    }

    return NextResponse.json(
      {
        patient,
        appointments: appointments || [],
        prescriptions: prescriptions || [],
        controlDates
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get patient details error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
