'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function DoctorDashboardPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      if (data.user.role !== 'doctor') {
        router.push('/')
        return
      }
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboards/doctor" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.doctor')}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">{t('common.home')}</Link>
              <LanguageSwitcher />
              <span className="text-gray-600">{user?.fullName}</span>
              <Link
                href="/api/auth/logout"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition shadow-sm"
                onClick={async (e) => {
                  e.preventDefault()
                  await fetch('/api/auth/logout', { method: 'POST' })
                  router.push('/login')
                }}
              >
                {t('auth.logout')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('common.welcome')}, {user?.fullName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Link
            href="/dashboards/doctor/income"
            className="flex items-center gap-4 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-emerald-600/50 transition cursor-pointer"
          >
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <h3 className="text-xl font-bold">{t('income.title')}</h3>
          </Link>

          <Link
            href="/dashboards/doctor/appointments/list"
            className="flex items-center gap-4 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-purple-600/50 transition cursor-pointer"
          >
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </span>
            <h3 className="text-xl font-bold">{t('appointments.list')}</h3>
          </Link>

          <Link
            href="/dashboards/doctor/prescriptions"
            className="flex items-center gap-4 bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-teal-600/50 transition cursor-pointer"
          >
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </span>
            <h3 className="text-xl font-bold">{t('prescriptions.title')}</h3>
          </Link>

          <Link
            href="/dashboards/doctor/certificat-medical"
            className="flex items-center gap-4 bg-gradient-to-br from-cyan-600 to-cyan-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-cyan-600/50 transition cursor-pointer"
          >
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </span>
            <h3 className="text-xl font-bold">{t('certificat.title')}</h3>
          </Link>

          <Link
            href="/dashboards/doctor/patients"
            className="flex items-center gap-4 bg-gradient-to-br from-pink-600 to-pink-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-pink-600/50 transition cursor-pointer"
          >
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </span>
            <h3 className="text-xl font-bold">{t('patients.title')}</h3>
          </Link>

          <Link
            href="/dashboards/doctor/statistics"
            className="flex items-center gap-4 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-orange-600/50 transition cursor-pointer"
          >
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </span>
            <h3 className="text-xl font-bold">{t('statistics.title')}</h3>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <Link
            href="/dashboards/doctor/profile"
            className="flex items-center justify-between text-gray-900 hover:text-blue-600 transition"
          >
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <h3 className="text-lg font-semibold">{t('profile.title')}</h3>
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}
