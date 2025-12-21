import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, created_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: `Failed to fetch profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Get role-specific data
    let additionalData = null;
    if (profile.role === 'patient') {
      const { data: patientData } = await supabase
        .from('patients')
        .select('phone')
        .eq('user_id', user.id)
        .single();
      additionalData = patientData;
    } else if (profile.role === 'dentist') {
      const { data: dentistData } = await supabase
        .from('dentists')
        .select('specialty')
        .eq('user_id', user.id)
        .single();
      additionalData = dentistData;
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
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

