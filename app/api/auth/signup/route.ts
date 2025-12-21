import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role, phone, specialty } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Email, password, full name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role-specific fields
    if (role === 'patient' && !phone) {
      return NextResponse.json(
        { error: 'Phone number is required for patients' },
        { status: 400 }
      );
    }

    if (role === 'dentist' && !specialty) {
      return NextResponse.json(
        { error: 'Specialty is required for dentists' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role,
      });

    if (profileError) {
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Create role-specific record
    if (role === 'patient') {
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          user_id: authData.user.id,
          phone: phone,
        });

      if (patientError) {
        return NextResponse.json(
          { error: `Patient record creation failed: ${patientError.message}` },
          { status: 500 }
        );
      }
    } else if (role === 'dentist') {
      const { error: dentistError } = await supabase
        .from('dentists')
        .insert({
          user_id: authData.user.id,
          specialty: specialty,
        });

      if (dentistError) {
        return NextResponse.json(
          { error: `Dentist record creation failed: ${dentistError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

