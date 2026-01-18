import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Validate phone (optional but recommended for patients)
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role 'patient' only (doctors are pre-created in database)
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        password: hashedPassword,
        full_name: fullName,
        role: 'patient',
        phone: phone,
      })
      .select('id, email, role, full_name')
      .single();

    if (userError) {
      return NextResponse.json(
        { error: `User creation failed: ${userError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.full_name,
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

