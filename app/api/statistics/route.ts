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
    const period = searchParams.get('period') || 'month'; // day, week, month, year

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
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // All appointments for doctor (all-time) for RDV breakdown
    const { data: allAppointments, error: allAppointmentsError } = await supabase
      .from('appointments')
      .select('id, status, confirmed_date_time, requested_date_time, payment_status')
      .eq('doctor_id', doctorId);

    if (allAppointmentsError) {
      return NextResponse.json(
        { error: `Failed to fetch appointments: ${allAppointmentsError.message}` },
        { status: 500 }
      );
    }

    const aptList = allAppointments || [];
    const totalAppointments = aptList.length;
    const rejectedCount = aptList.filter((a: { status: string }) => a.status === 'rejected').length;
    const cancelledCount = aptList.filter((a: { status: string }) => a.status === 'cancelled').length;
    const completedOnlyCount = aptList.filter((a: { status: string }) => a.status === 'completed').length;
    const confirmedCount = aptList.filter((a: { status: string }) => a.status === 'confirmed').length;
    const completedCount = completedOnlyCount + confirmedCount; // Terminés = completed + confirmé
    const pendingCount = aptList.filter((a: { status: string }) => a.status === 'pending').length;

    // Period-filtered: for income (paid in period)
    const isoStart = startDate.toISOString();
    const isoEnd = endDate.toISOString();
    const inPeriod = aptList.filter((a: { confirmed_date_time: string | null; payment_status: string }) => {
      const dt = a.confirmed_date_time;
      if (!dt) return false;
      return dt >= isoStart && dt <= isoEnd;
    });
    const paidCount = inPeriod.filter((a: { payment_status: string }) => a.payment_status === 'paid').length;

    let totalIncome = 0;
    let rdvUnitPrice = 0;
    const { data: tariff } = await supabase
      .from('tariffs')
      .select('price')
      .eq('key', 'basic_rdv')
      .single();
    rdvUnitPrice = (tariff?.price as number) ?? 70;
    totalIncome = paidCount * rdvUnitPrice;

    // Total patients (all-time unique)
    const uniquePatientIds = [...new Set(aptList.map((a: { patient_id: string }) => a.patient_id))];
    const totalPatients = uniquePatientIds.length;

    // Prescriptions count (all-time)
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('doctor_id', doctorId);
    const prescriptionsCount = prescriptions?.length || 0;

    // Control dates count (all-time)
    const { data: controlDates } = await supabase
      .from('control_dates')
      .select('id')
      .eq('doctor_id', doctorId);
    const controlDatesCount = controlDates?.length || 0;

    // Medical certificates count (all-time)
    let certificatCount = 0;
    const { data: certs } = await supabase
      .from('medical_certificates')
      .select('id')
      .eq('doctor_id', doctorId);
    if (certs) certificatCount = certs.length;

    return NextResponse.json(
      {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        statistics: {
          totalAppointments,
          rejectedAppointments: rejectedCount,
          cancelledAppointments: cancelledCount,
          completedAppointments: completedCount, // includes confirmed (counted as terminé)
          confirmedAppointments: confirmedCount,
          pendingAppointments: pendingCount,
          totalPatients,
          prescriptionsCount,
          certificatCount,
          controlDatesCount,
          paidAppointmentsCount: paidCount,
          rdvUnitPrice,
          totalIncome
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
