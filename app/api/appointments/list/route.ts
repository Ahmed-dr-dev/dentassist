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

    // Get all appointments for this patient
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        requested_date_time,
        confirmed_date_time,
        rejection_reason,
        reason,
        alternative_dates,
        suggested_dentist_name,
        suggested_dentist_address,
        suggested_dentist_phone,
        payment_approval_path,
        payment_approval_file_name,
        payment_status,
        created_at,
        doctor:users!appointments_doctor_id_fkey(id, full_name, email, specialty)
      `)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false });

    if (appointmentsError) {
      return NextResponse.json(
        { error: `Failed to fetch appointments: ${appointmentsError.message}` },
        { status: 500 }
      );
    }

    // Get queue positions for confirmed appointments
    const appointmentsWithQueue = await Promise.all(
      (appointments || []).map(async (apt) => {
        if (apt.status === 'confirmed' && apt.confirmed_date_time) {
          const appointmentTime = new Date(apt.confirmed_date_time);

          const { data: appointmentsBefore } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', (apt.doctor as any).id)
            .eq('status', 'confirmed')
            .lt('confirmed_date_time', appointmentTime.toISOString())
            .gte('confirmed_date_time', new Date(appointmentTime.setHours(0, 0, 0, 0)).toISOString());

          const patientsBefore = appointmentsBefore?.length || 0;

          return {
            ...apt,
            queuePosition: patientsBefore + 1,
            patientsBefore,
            estimatedWaitMinutes: patientsBefore > 0 ? patientsBefore * 30 + 15 : null
          };
        }
        return apt;
      })
    );

    return NextResponse.json(
      { appointments: appointmentsWithQueue },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get appointments list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
