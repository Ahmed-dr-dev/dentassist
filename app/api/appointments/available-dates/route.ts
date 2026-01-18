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
    const days = parseInt(searchParams.get('days') || '7');

    const supabase = await createClient();

    // Verify user is doctor
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Only doctors can view available dates' },
        { status: 403 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all confirmed appointments for next N days
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    endDate.setHours(23, 59, 59, 999);

    const { data: confirmedAppointments } = await supabase
      .from('appointments')
      .select('confirmed_date_time')
      .eq('doctor_id', userId)
      .eq('status', 'confirmed')
      .gte('confirmed_date_time', today.toISOString())
      .lte('confirmed_date_time', endDate.toISOString());

    const bookedSlots = (confirmedAppointments || []).map(apt => new Date(apt.confirmed_date_time).getTime());

    // Generate available slots for next N days (30 min intervals, 9am-5pm)
    const availableSlots: string[] = [];
    for (let day = 0; day < days; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(9, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(17, 0, 0, 0);

      for (let time = startOfDay.getTime(); time <= endOfDay.getTime(); time += 30 * 60000) {
        if (!bookedSlots.some(slot => Math.abs(slot - time) < 30 * 60000)) {
          availableSlots.push(new Date(time).toISOString());
        }
      }
    }

    return NextResponse.json(
      { availableDates: availableSlots },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get available dates error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
