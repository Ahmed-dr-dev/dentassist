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

    // Verify user is doctor
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Only doctors can view patients' },
        { status: 403 }
      );
    }

    // Get all patients who have appointments with this doctor
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('doctor_id', userId);

    if (appointmentsError) {
      return NextResponse.json(
        { error: `Failed to fetch patients: ${appointmentsError.message}` },
        { status: 500 }
      );
    }

    // Get unique patient IDs
    const patientIds = [...new Set((appointments || []).map(apt => apt.patient_id))];

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

    // Get appointment counts for each patient
    const patientsWithCounts = await Promise.all(
      (patients || []).map(async (patient) => {
        const { data: patientAppointments } = await supabase
          .from('appointments')
          .select('id, status, confirmed_date_time')
          .eq('doctor_id', userId)
          .eq('patient_id', patient.id)
          .order('confirmed_date_time', { ascending: false });

        return {
          ...patient,
          totalAppointments: patientAppointments?.length || 0,
          completedAppointments: patientAppointments?.filter(apt => apt.status === 'completed').length || 0,
          upcomingAppointments: patientAppointments?.filter(apt => apt.status === 'confirmed').length || 0
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
