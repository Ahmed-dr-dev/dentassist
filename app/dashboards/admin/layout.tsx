import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/app/utils/supabase/server'

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: user } = await supabase.from('users').select('role').eq('id', userId).single()

  if (!user || user.role !== 'admin') redirect('/login')

  return <div className="min-h-screen bg-gray-50">{children}</div>
}
