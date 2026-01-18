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
    const description = formData.get('description') as string | null;

    if (!appointmentId || !file) {
      return NextResponse.json(
        { error: 'Appointment ID and file are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is doctor
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Only doctors can create prescriptions' },
        { status: 403 }
      );
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id, status')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.doctor_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to create prescription for this appointment' },
        { status: 403 }
      );
    }

    // Verify file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Create prescriptions directory if it doesn't exist
    const prescriptionsDir = join(process.cwd(), 'public', 'prescriptions');
    try {
      await mkdir(prescriptionsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `prescription_${appointmentId}_${timestamp}.pdf`;
    const filePath = join(prescriptionsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Store prescription metadata in database
    const publicFilePath = `/prescriptions/${fileName}`;

    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        doctor_id: userId,
        file_path: publicFilePath,
        file_name: file.name || fileName,
        description: description || null
      })
      .select('id, file_path, file_name, created_at')
      .single();

    if (prescriptionError) {
      return NextResponse.json(
        { error: `Failed to create prescription: ${prescriptionError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Prescription created successfully',
        prescription
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create prescription error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
