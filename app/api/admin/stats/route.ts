import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'

async function getAdminUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return null
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('id, role').eq('id', userId).single()
  return data?.role === 'admin' ? data : null
}

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const supabase = await createClient()

    const [
      { count: totalUsers },
      { count: totalDoctors },
      { count: totalPatients },
      { count: totalAssistants },
      { count: totalAdmins },
      { count: totalAppointments },
      { count: pendingAppointments },
      { count: completedAppointments },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'assistant'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ])

    return NextResponse.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAssistants,
      totalAdmins,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
    })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
