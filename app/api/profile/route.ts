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

    // Try to get user info - try with RIB columns first, fallback to basic columns if they don't exist
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, phone, specialty, role, created_at, rib_bank_name, rib_account_number, rib_iban, rib_bic')
      .eq('id', userId)
      .single();

    // If error due to missing columns, try without RIB columns
    if (userError && (userError.message?.includes('column') || userError.code === '42703')) {
      const { data: basicUser, error: basicError } = await supabase
        .from('users')
        .select('id, email, full_name, phone, specialty, role, created_at')
        .eq('id', userId)
        .single();
      
      if (basicError) {
        userError = basicError;
      } else {
        // Add null RIB fields if columns don't exist
        user = {
          ...basicUser,
          rib_bank_name: null,
          rib_account_number: null,
          rib_iban: null,
          rib_bic: null
        };
        userError = null;
      }
    }

    if (userError) {
      console.error('Profile GET error:', userError);
      if (userError.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'User not found', details: `No user found with ID: ${userId}` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch profile: ${userError.message}`, details: userError.message },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', details: `No user found with ID: ${userId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          specialty: user.specialty,
          role: user.role,
          ribBankName: user.rib_bank_name || null,
          ribAccountNumber: user.rib_account_number || null,
          ribIban: user.rib_iban || null,
          ribBic: user.rib_bic || null,
          createdAt: user.created_at
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fullName, phone, specialty, ribBankName, ribAccountNumber, ribIban, ribBic } = await request.json();

    const supabase = await createClient();

    // Verify user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (specialty !== undefined && existingUser.role === 'doctor') {
      updateData.specialty = specialty;
    }
    
    // RIB fields - only for doctors, and only if provided
    // Note: These will fail if columns don't exist - user needs to run migration
    if (existingUser.role === 'doctor') {
      if (ribBankName !== undefined) updateData.rib_bank_name = ribBankName || null;
      if (ribAccountNumber !== undefined) updateData.rib_account_number = ribAccountNumber || null;
      if (ribIban !== undefined) updateData.rib_iban = ribIban || null;
      if (ribBic !== undefined) updateData.rib_bic = ribBic || null;
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, full_name, phone, specialty, role, rib_bank_name, rib_account_number, rib_iban, rib_bic')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.full_name,
          phone: updatedUser.phone,
          specialty: updatedUser.specialty,
          role: updatedUser.role,
          ribBankName: updatedUser.rib_bank_name || null,
          ribAccountNumber: updatedUser.rib_account_number || null,
          ribIban: updatedUser.rib_iban || null,
          ribBic: updatedUser.rib_bic || null
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
