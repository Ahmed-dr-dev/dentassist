import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

async function getAdminUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return null
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('id, role').eq('id', userId).single()
  return data?.role === 'admin' ? data : null
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { email, password, fullName, role, phone, specialty } = await request.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validRoles = ['patient', 'doctor', 'assistant', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const supabase = await createClient()
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from('users')
      .insert({ email, password: hashedPassword, full_name: fullName, role, phone: phone || null, specialty: specialty || null })
      .select('id, email, full_name, role')
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'User created successfully', user: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
