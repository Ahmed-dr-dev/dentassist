import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

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
    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        password: hashedPassword,
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
          user_id: userId,
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
          user_id: userId,
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
          id: userId,
          email: email,
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

