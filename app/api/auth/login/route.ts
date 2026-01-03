import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

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

    // Fetch profile with password
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, password, role, full_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, profile.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
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

    // Set user_id cookie
    const cookieStore = await cookies();
    cookieStore.set('user_id', profile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          fullName: profile.full_name,
          ...additionalData,
        },
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

