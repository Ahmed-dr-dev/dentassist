import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: doctors, error: doctorsError } = await supabase
      .from('users')
      .select('id, full_name, email, specialty')
      .eq('role', 'doctor')
      .order('full_name', { ascending: true });

    if (doctorsError) {
      return NextResponse.json(
        { error: `Failed to fetch doctors: ${doctorsError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { doctors: doctors || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get doctors list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
