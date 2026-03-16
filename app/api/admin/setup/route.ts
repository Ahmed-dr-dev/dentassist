import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password, fullName, setupKey } = await request.json()

    if (!email || !password || !fullName || !setupKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expectedKey = process.env.ADMIN_SETUP_KEY
    if (!expectedKey || setupKey !== expectedKey) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Admin account already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: admin, error } = await supabase
      .from('users')
      .insert({ email, password: hashedPassword, full_name: fullName, role: 'admin' })
      .select('id, email, full_name, role')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Admin account created successfully', admin }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
