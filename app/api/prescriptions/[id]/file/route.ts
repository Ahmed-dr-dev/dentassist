import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: prescriptionId } = await params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === '1';

    const supabase = await createClient();

    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select('id, file_path, file_name, patient_id, doctor_id')
      .eq('id', prescriptionId)
      .single();

    if (prescriptionError || !prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Allow: patient (own), doctor (own), assistant (any doctor's)
    const isPatient = user.role === 'patient' && prescription.patient_id === userId;
    let isDoctorOrAssistant = false;
    if (user.role === 'doctor' && prescription.doctor_id === userId) isDoctorOrAssistant = true;
    if (user.role === 'assistant') {
      const { data: doctor } = await supabase.from('users').select('id').eq('role', 'doctor').limit(1).single();
      if (doctor && prescription.doctor_id === doctor.id) isDoctorOrAssistant = true;
    }

    if (!isPatient && !isDoctorOrAssistant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const filePath = prescription.file_path as string;
    if (!filePath || !filePath.startsWith('/prescriptions/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const absolutePath = join(process.cwd(), 'public', filePath.replace(/^\//, ''));

    let buffer: Buffer;
    try {
      buffer = await readFile(absolutePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const filename = (prescription.file_name as string) || 'prescription.pdf';
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Length', String(buffer.length));
    headers.set('Content-Disposition', download ? `attachment; filename="${filename}"` : 'inline');

    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    console.error('Prescription file error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
