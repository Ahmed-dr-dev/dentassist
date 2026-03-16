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

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const supabase = await createClient()
    let query = supabase
      .from('users')
      .select('id, email, full_name, role, phone, specialty, created_at')
      .order('created_at', { ascending: false })

    if (role && role !== 'all') query = query.eq('role', role)
    if (search) query = query.ilike('full_name', `%${search}%`)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ users: data })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
