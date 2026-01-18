import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the default doctor (first doctor in database)
    const { data: doctor, error: doctorError } = await supabase
      .from('users')
      .select('id, full_name, rib_bank_name, rib_account_number, rib_iban, rib_bic')
      .eq('role', 'doctor')
      .limit(1)
      .single();

    if (doctorError || !doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        doctor: {
          id: doctor.id,
          fullName: doctor.full_name,
          ribBankName: doctor.rib_bank_name || null,
          ribAccountNumber: doctor.rib_account_number || null,
          ribIban: doctor.rib_iban || null,
          ribBic: doctor.rib_bic || null
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get doctor RIB error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
