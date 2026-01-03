import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, created_at')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get role-specific data
    let additionalData = null;
    if (profile.role === 'patient') {
      const { data: patientData } = await supabase
        .from('patients')
        .select('phone')
        .eq('user_id', profile.id)
        .single();
      additionalData = patientData;
    } else if (profile.role === 'dentist') {
      const { data: dentistData } = await supabase
        .from('dentists')
        .select('specialty')
        .eq('user_id', profile.id)
        .single();
      additionalData = dentistData;
    }

    return NextResponse.json(
      {
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          fullName: profile.full_name,
          createdAt: profile.created_at,
          ...additionalData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

