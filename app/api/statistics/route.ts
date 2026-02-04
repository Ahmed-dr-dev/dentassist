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
    const period = searchParams.get('period') || 'month'; // day, week, month

    const supabase = await createClient();

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'doctor' && user.role !== 'assistant')) {
      return NextResponse.json(
        { error: 'Only doctors or assistants can view statistics' },
        { status: 403 }
      );
    }

    let doctorId = userId;
    if (user.role === 'assistant') {
      const { data: doctor } = await supabase.from('users').select('id').eq('role', 'doctor').limit(1).single();
      if (!doctor) return NextResponse.json({ error: 'No doctor found' }, { status: 404 });
      doctorId = doctor.id;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'day') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(now);
      const dayOfWeek = startDate.getDay();
      const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get appointment statistics
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, status, confirmed_date_time')
      .eq('doctor_id', doctorId)
      .gte('confirmed_date_time', startDate.toISOString())
      .lte('confirmed_date_time', endDate.toISOString());

    if (appointmentsError) {
      return NextResponse.json(
        { error: `Failed to fetch statistics: ${appointmentsError.message}` },
        { status: 500 }
      );
    }

    const totalAppointments = appointments?.length || 0;
    const confirmedCount = appointments?.filter(apt => apt.status === 'confirmed').length || 0;
    const completedCount = appointments?.filter(apt => apt.status === 'completed').length || 0;
    const cancelledCount = appointments?.filter(apt => apt.status === 'cancelled').length || 0;

    // Get unique patients count
    const { data: uniquePatients, error: patientsError } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('doctor_id', userId)
      .gte('confirmed_date_time', startDate.toISOString())
      .lte('confirmed_date_time', endDate.toISOString());

    const uniquePatientIds = uniquePatients ? [...new Set(uniquePatients.map(apt => apt.patient_id))] : [];
    const totalPatients = uniquePatientIds.length;

    // Get prescriptions count
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('doctor_id', doctorId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const prescriptionsCount = prescriptions?.length || 0;

    return NextResponse.json(
      {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        statistics: {
          totalAppointments,
          confirmedAppointments: confirmedCount,
          completedAppointments: completedCount,
          cancelledAppointments: cancelledCount,
          totalPatients,
          prescriptionsCount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
