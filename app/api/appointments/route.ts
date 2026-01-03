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

    // Verify user is a dentist
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || profile.role !== 'dentist') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get date filter from query params
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Build query
    let query = supabase
      .from('appointments')
      .select('id, patient_id, appointment_date, appointment_time, duration, service, status, notes')
      .eq('dentist_id', userId)
      .order('appointment_time', { ascending: true });

    if (date) {
      query = query.eq('appointment_date', date);
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      return NextResponse.json(
        { error: `Failed to fetch appointments: ${appointmentsError.message}` },
        { status: 500 }
      );
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(
        { appointments: [] },
        { status: 200 }
      );
    }

    // Fetch patient data
    const patientIds = appointments.map((apt: any) => apt.patient_id);
    const { data: patients } = await supabase
      .from('patients')
      .select('user_id, phone')
      .in('user_id', patientIds);

    // Fetch profiles for patients
    const userIds = patients?.map((p: any) => p.user_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    // Format appointments
    const formattedAppointments = appointments.map((apt: any) => {
      const patient = patients?.find((p: any) => p.user_id === apt.patient_id);
      const profile = profiles?.find((p: any) => p.id === apt.patient_id);
      
      return {
        id: apt.id,
        patient: profile?.full_name || 'Unknown',
        service: apt.service || 'Consultation',
        time: apt.appointment_time || '',
        duration: apt.duration || 30,
        status: apt.status || 'pending',
        phone: patient?.phone || '',
        email: profile?.email || '',
        date: apt.appointment_date,
        notes: apt.notes || '',
      };
    });

    return NextResponse.json(
      { appointments: formattedAppointments },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

