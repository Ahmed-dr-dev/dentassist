import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    const formData = await request.formData();
    const appointmentId = formData.get('appointmentId') as string;
    const file = formData.get('file') as File;

    if (!appointmentId || !file) {
      return NextResponse.json(
        { error: 'Appointment ID and file are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is patient
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Only patients can upload payment approval' },
        { status: 403 }
      );
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, patient_id, status')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.patient_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to upload payment for this appointment' },
        { status: 403 }
      );
    }

    if (appointment.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Payment can only be uploaded for confirmed appointments' },
        { status: 400 }
      );
    }

    // Create payment approvals directory
    const paymentsDir = join(process.cwd(), 'public', 'payment-approvals');
    try {
      await mkdir(paymentsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `payment_${appointmentId}_${timestamp}.${file.name.split('.').pop()}`;
    const filePath = join(paymentsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicFilePath = `/payment-approvals/${fileName}`;

    // Update appointment with payment approval
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        payment_approval_path: publicFilePath,
        payment_approval_file_name: file.name || fileName
      })
      .eq('id', appointmentId)
      .select('id, payment_approval_path, payment_approval_file_name')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update appointment: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Payment approval uploaded successfully',
        appointment: updatedAppointment
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload payment error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
