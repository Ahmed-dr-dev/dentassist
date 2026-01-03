import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

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

    // Verify user is a dentist
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || profile.role !== 'dentist') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch all patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('user_id, phone');

    if (patientsError) {
      return NextResponse.json(
        { error: `Failed to fetch patients: ${patientsError.message}` },
        { status: 500 }
      );
    }

    if (!patients || patients.length === 0) {
      return NextResponse.json(
        { patients: [] },
        { status: 200 }
      );
    }

    // Fetch profiles for all patients
    const userIds = patients.map(p => p.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .in('id', userIds)
      .eq('role', 'patient');

    if (profilesError) {
      return NextResponse.json(
        { error: `Failed to fetch profiles: ${profilesError.message}` },
        { status: 500 }
      );
    }

    // Combine patient and profile data
    const formattedPatients = patients.map((patient: any) => {
      const profile = profiles?.find((p: any) => p.id === patient.user_id);
      return {
        id: patient.user_id,
        name: profile?.full_name || 'Unknown',
        email: profile?.email || '',
        phone: patient.phone || '',
        createdAt: profile?.created_at || null,
      };
    });

    return NextResponse.json(
      { patients: formattedPatients },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Verify user is a dentist
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || profile.role !== 'dentist') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { email, password, fullName, phone } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName || !phone) {
      return NextResponse.json(
        { error: 'Email, password, full name, and phone are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const newUserId = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUserId,
        email: email,
        password: hashedPassword,
        full_name: fullName,
        role: 'patient',
      });

    if (profileError) {
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Create patient record
    const { error: patientError } = await supabase
      .from('patients')
      .insert({
        user_id: newUserId,
        phone: phone,
      });

    if (patientError) {
      return NextResponse.json(
        { error: `Patient record creation failed: ${patientError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Patient created successfully',
        patient: {
          id: newUserId,
          email: email,
          fullName: fullName,
          phone: phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
