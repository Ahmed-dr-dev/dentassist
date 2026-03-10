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

    const supabase = await createClient();

    // Verify user is doctor or assistant
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'doctor' && user.role !== 'assistant')) {
      return NextResponse.json(
        { error: 'Only doctors or assistants can view patients' },
        { status: 403 }
      );
    }

    // Assistant sees the default doctor's patients; doctor uses own id
    let doctorId = userId;
    if (user.role === 'assistant') {
      const { data: doctor } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'doctor')
        .limit(1)
        .single();
      if (!doctor) {
        return NextResponse.json(
          { error: 'No doctor found' },
          { status: 404 }
        );
      }
      doctorId = doctor.id;
    }

    const { searchParams } = new URL(request.url);
    // Optional filter by RDV date (YYYY-MM-DD): only patients with an appointment on that day
    const dateFilter = searchParams.get('date');
    let patientIds: string[] = [];

    if (dateFilter) {
      const dayStart = new Date(dateFilter + 'T00:00:00.000Z');
      const dayEnd = new Date(dateFilter + 'T23:59:59.999Z');
      const isoStart = dayStart.toISOString();
      const isoEnd = dayEnd.toISOString();
      const { data: byConfirmed } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', doctorId)
        .not('confirmed_date_time', 'is', null)
        .gte('confirmed_date_time', isoStart)
        .lte('confirmed_date_time', isoEnd);
      const { data: byRequested } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', doctorId)
        .eq('status', 'pending')
        .gte('requested_date_time', isoStart)
        .lte('requested_date_time', isoEnd);
      const ids = new Set<string>();
      (byConfirmed || []).forEach((a: { patient_id: string }) => ids.add(a.patient_id));
      (byRequested || []).forEach((a: { patient_id: string }) => ids.add(a.patient_id));
      patientIds = [...ids];
    } else {
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', doctorId);

      if (appointmentsError) {
        return NextResponse.json(
          { error: `Failed to fetch patients: ${appointmentsError.message}` },
          { status: 500 }
        );
      }
      patientIds = [...new Set((appointments || []).map(apt => apt.patient_id))];
    }

    if (patientIds.length === 0) {
      return NextResponse.json(
        { patients: [] },
        { status: 200 }
      );
    }

    // Get patient details with appointment counts
    const { data: patients, error: patientsError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, created_at')
      .in('id', patientIds)
      .eq('role', 'patient')
      .order('full_name', { ascending: true });

    if (patientsError) {
      return NextResponse.json(
        { error: `Failed to fetch patients: ${patientsError.message}` },
        { status: 500 }
      );
    }

    // Control dates count per patient (dates de contrôle fixées par le docteur)
    const { data: controlCounts } = await supabase
      .from('control_dates')
      .select('patient_id')
      .eq('doctor_id', doctorId);
    const controlByPatient: Record<string, number> = {};
    (controlCounts || []).forEach((row: { patient_id: string }) => {
      controlByPatient[row.patient_id] = (controlByPatient[row.patient_id] || 0) + 1;
    });

    // Get appointment counts for each patient
    const patientsWithCounts = await Promise.all(
      (patients || []).map(async (patient) => {
        const { data: patientAppointments } = await supabase
          .from('appointments')
          .select('id, status, confirmed_date_time')
          .eq('doctor_id', doctorId)
          .eq('patient_id', patient.id)
          .order('confirmed_date_time', { ascending: false });

        return {
          ...patient,
          totalAppointments: patientAppointments?.length || 0,
          completedAppointments: patientAppointments?.filter(apt => apt.status === 'completed').length || 0,
          upcomingAppointments: patientAppointments?.filter(apt => apt.status === 'confirmed').length || 0,
          controlDatesCount: controlByPatient[patient.id] || 0
        };
      })
    );

    return NextResponse.json(
      { patients: patientsWithCounts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get patients list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
