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
    const period = searchParams.get('period') || 'day'; // day, week, month

    const supabase = await createClient();

    // Verify user is doctor
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Only doctors can view appointments' },
        { status: 403 }
      );
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
      const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get appointments for this doctor in the period
    // For confirmed/completed appointments, filter by confirmed_date_time
    // For pending appointments, filter by requested_date_time
    const { data: confirmedAppointments, error: confirmedError } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        requested_date_time,
        confirmed_date_time,
        rejection_reason,
        reason,
        medical_history,
        current_medications,
        payment_status,
        payment_approval_path,
        payment_approval_file_name,
        created_at,
        patient:users!appointments_patient_id_fkey(id, full_name, email, phone)
      `)
      .eq('doctor_id', userId)
      .in('status', ['confirmed', 'completed', 'rejected', 'cancelled'])
      .gte('confirmed_date_time', startDate.toISOString())
      .lte('confirmed_date_time', endDate.toISOString())
      .order('confirmed_date_time', { ascending: true });

    if (confirmedError) {
      return NextResponse.json(
        { error: `Failed to fetch appointments: ${confirmedError.message}` },
        { status: 500 }
      );
    }

    // Get pending appointments filtered by requested_date_time
    const { data: pendingAppointments, error: pendingError } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        requested_date_time,
        confirmed_date_time,
        rejection_reason,
        reason,
        medical_history,
        current_medications,
        payment_status,
        payment_approval_path,
        payment_approval_file_name,
        created_at,
        patient:users!appointments_patient_id_fkey(id, full_name, email, phone)
      `)
      .eq('doctor_id', userId)
      .eq('status', 'pending')
      .gte('requested_date_time', startDate.toISOString())
      .lte('requested_date_time', endDate.toISOString())
      .order('requested_date_time', { ascending: true });

    if (pendingError) {
      console.error('Error fetching pending appointments:', pendingError);
    }

    const allAppointments = [
      ...(confirmedAppointments || []),
      ...(pendingAppointments || [])
    ];

    // Count confirmed appointments for quota info
    const confirmedCount = allAppointments.filter(apt => apt.status === 'confirmed').length;

    return NextResponse.json(
      {
        appointments: allAppointments,
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        confirmedCount,
        remainingQuota: Math.max(0, 30 - confirmedCount)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
