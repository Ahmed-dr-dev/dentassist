import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

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

    const { requestedDateTime, reason, medicalHistory, currentMedications } = await request.json();

    if (!requestedDateTime) {
      return NextResponse.json(
        { error: 'Requested date time is required' },
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
        { error: 'Only patients can request appointments' },
        { status: 403 }
      );
    }

    // Get the default doctor (first doctor in database - this is a single dentist clinic)
    const { data: doctor } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'doctor')
      .limit(1)
      .single();

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctorId = doctor.id;

    const requestedDate = new Date(requestedDateTime);

    // Check for time conflicts with confirmed appointments for this doctor
    const { data: conflictingAppointments } = await supabase
      .from('appointments')
      .select('confirmed_date_time')
      .eq('doctor_id', doctorId)
      .eq('status', 'confirmed')
      .gte('confirmed_date_time', new Date(requestedDate.getTime() - 30 * 60000).toISOString())
      .lte('confirmed_date_time', new Date(requestedDate.getTime() + 30 * 60000).toISOString());

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      // Time conflict - find available slots
      const { data: allConfirmedAppointments } = await supabase
        .from('appointments')
        .select('confirmed_date_time')
        .eq('doctor_id', doctorId)
        .eq('status', 'confirmed')
        .gte('confirmed_date_time', new Date().toISOString())
        .order('confirmed_date_time', { ascending: true })
        .limit(20);

      const bookedSlots = (allConfirmedAppointments || []).map(apt => new Date(apt.confirmed_date_time).getTime());

      // Generate available time slots (30 min intervals)
      const availableSlots = [];
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(9, 0, 0, 0);
      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(17, 0, 0, 0);

      for (let time = startOfDay.getTime(); time <= endOfDay.getTime(); time += 30 * 60000) {
        if (!bookedSlots.some(slot => Math.abs(slot - time) < 30 * 60000)) {
          availableSlots.push(new Date(time).toISOString());
          if (availableSlots.length >= 5) break;
        }
      }

      // Return external dentists in Gafsa, Tunisia (when alternatives are declined)
      const externalDentistsInGafsa = [
        {
          id: 'external-1',
          name: 'Dr. Ahmed Ben Ali',
          address: 'Avenue Habib Bourguiba, Gafsa',
          phone: '+216 76 220 123',
          specialty: 'Chirurgie dentaire'
        },
        {
          id: 'external-2',
          name: 'Dr. Fatma Mezzi',
          address: 'Rue de la République, Gafsa',
          phone: '+216 76 221 456',
          specialty: 'Orthodontie'
        },
        {
          id: 'external-3',
          name: 'Dr. Mohamed Trabelsi',
          address: 'Zone Industrielle, Gafsa',
          phone: '+216 76 225 789',
          specialty: 'Dentisterie générale'
        },
        {
          id: 'external-4',
          name: 'Dr. Salma Hammami',
          address: 'Cité El Bassatine, Gafsa',
          phone: '+216 76 228 012',
          specialty: 'Parodontologie'
        },
        {
          id: 'external-5',
          name: 'Dr. Tarek Jerbi',
          address: 'Avenue de l\'Indépendance, Gafsa',
          phone: '+216 76 230 345',
          specialty: 'Endodontie'
        }
      ];

      return NextResponse.json(
        {
          rejected: true,
          reason: 'Le créneau demandé n\'est pas disponible',
          availableSlots,
          externalDentists: externalDentistsInGafsa
        },
        { status: 200 }
      );
    }

    // Create appointment request
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: userId,
        doctor_id: doctorId,
        requested_date_time: requestedDate.toISOString(),
        status: 'pending',
        reason: reason || null,
        medical_history: medicalHistory || null,
        current_medications: currentMedications || null
      })
      .select('id, status, requested_date_time, created_at')
      .single();

    if (appointmentError) {
      return NextResponse.json(
        { error: `Failed to create appointment: ${appointmentError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Appointment request submitted successfully',
        appointment
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Appointment request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
