import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 500 }
      );
    }

    // Get user profile to include role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', authData.user.id)
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
        .eq('user_id', authData.user.id)
        .single();
      additionalData = patientData;
    } else if (profile.role === 'dentist') {
      const { data: dentistData } = await supabase
        .from('dentists')
        .select('specialty')
        .eq('user_id', authData.user.id)
        .single();
      additionalData = dentistData;
    }

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile.role,
          fullName: profile.full_name,
          ...additionalData,
        },
        session: authData.session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

