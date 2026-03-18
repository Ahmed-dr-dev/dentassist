'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface Stats {
  totalUsers: number
  totalDoctors: number
  totalPatients: number
  totalAssistants: number
  totalAdmins: number
  totalAppointments: number
  pendingAppointments: number
  completedAppointments: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/user').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/messages/list').then(r => r.ok ? r.json() : null),
    ]).then(([userData, statsData, msgData]) => {
      if (!userData?.user || userData.user.role !== 'admin') {
        router.push('/login')
        return
      }
      setUser(userData.user)
      if (statsData) setStats(statsData)
      if (msgData) setUnreadMessages(msgData.unreadCount ?? 0)
    }).finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    )
  }

  const statCards = [
    { label: t('admin.stats.totalUsers'), value: stats?.totalUsers ?? 0, bg: 'from-blue-600 to-blue-500', shadow: 'hover:shadow-blue-600/50', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
    { label: t('admin.stats.doctors'), value: stats?.totalDoctors ?? 0, bg: 'from-emerald-600 to-emerald-500', shadow: 'hover:shadow-emerald-600/50', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
    { label: t('admin.stats.patients'), value: stats?.totalPatients ?? 0, bg: 'from-purple-600 to-purple-500', shadow: 'hover:shadow-purple-600/50', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { label: t('admin.stats.assistants'), value: stats?.totalAssistants ?? 0, bg: 'from-teal-600 to-teal-500', shadow: 'hover:shadow-teal-600/50', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
    { label: t('admin.stats.totalAppointments'), value: stats?.totalAppointments ?? 0, bg: 'from-indigo-600 to-indigo-500', shadow: 'hover:shadow-indigo-600/50', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  ]

  const quickLinks = [
    { href: '/dashboards/admin/users', label: t('admin.users.title'), desc: t('admin.users.manageDesc'), bg: 'from-blue-600 to-blue-500', shadow: 'hover:shadow-blue-600/50', badge: null, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
    { href: '/dashboards/admin/users/create', label: t('admin.users.create'), desc: t('admin.users.createDesc'), bg: 'from-emerald-600 to-emerald-500', shadow: 'hover:shadow-emerald-600/50', badge: null, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /> },
    { href: '/dashboards/admin/messages', label: t('admin.messages.title'), desc: t('admin.messages.desc'), bg: 'from-pink-600 to-pink-500', shadow: 'hover:shadow-pink-600/50', badge: unreadMessages, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboards/admin" className="text-xl font-bold text-gray-900">
              {t('common.appName')} — <span className="text-red-600">Admin</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">{t('common.home')}</Link>
              <LanguageSwitcher />
              <span className="text-gray-600 text-sm">{user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm transition shadow-sm"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('admin.dashboard')}</h1>
          <p className="text-gray-600">{t('admin.welcome')}, {user?.fullName}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className={`flex items-center gap-4 bg-gradient-to-br ${card.bg} rounded-xl p-6 text-white hover:shadow-lg ${card.shadow} transition`}>
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
              </span>
              <div>
                <p className="text-white/80 text-sm">{card.label}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className={`flex items-center gap-4 bg-gradient-to-br ${link.bg} rounded-xl p-6 text-white hover:shadow-lg ${link.shadow} transition cursor-pointer relative`}
            >
              {link.badge !== null && link.badge > 0 && (
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-white text-pink-600 text-xs font-bold rounded-full">
                  {link.badge}
                </span>
              )}
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{link.icon}</svg>
              </span>
              <div>
                <h3 className="text-lg font-bold">{link.label}</h3>
                <p className="text-white/80 text-sm">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
