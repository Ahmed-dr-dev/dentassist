import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: patientId } = await params;

    // Verify patient exists
    const { data: patientProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', patientId)
      .single();

    if (!patientProfile || patientProfile.role !== 'patient') {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Update profile
    const updateData: any = {};
    if (fullName) updateData.full_name = fullName;
    if (email) {
      // Check if email is already taken by another user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .neq('id', patientId)
        .single();

      if (existingProfile) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', patientId);

      if (profileError) {
        return NextResponse.json(
          { error: `Profile update failed: ${profileError.message}` },
          { status: 500 }
        );
      }
    }

    // Update patient record
    if (phone) {
      const { error: patientError } = await supabase
        .from('patients')
        .update({ phone })
        .eq('user_id', patientId);

      if (patientError) {
        return NextResponse.json(
          { error: `Patient record update failed: ${patientError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Patient updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

