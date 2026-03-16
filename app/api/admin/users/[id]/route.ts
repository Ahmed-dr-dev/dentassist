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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, specialty, created_at')
      .eq('id', id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user: data })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { fullName, role, phone, specialty, password } = body

    const validRoles = ['patient', 'doctor', 'assistant', 'admin']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updates: Record<string, any> = {}
    if (fullName) updates.full_name = fullName
    if (role) updates.role = role
    if (phone !== undefined) updates.phone = phone || null
    if (specialty !== undefined) updates.specialty = specialty || null
    if (password) updates.password = await bcrypt.hash(password, 10)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, full_name, role')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'User updated successfully', user: data })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    if (id === admin.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
