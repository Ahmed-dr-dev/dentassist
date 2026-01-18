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

    // Get all prescriptions for this patient
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select(`
        id,
        file_path,
        file_name,
        description,
        created_at,
        appointment_id,
        doctor:users!prescriptions_doctor_id_fkey(id, full_name, email)
      `)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false });

    if (prescriptionsError) {
      return NextResponse.json(
        { error: `Failed to fetch prescriptions: ${prescriptionsError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { prescriptions: prescriptions || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get prescriptions list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
