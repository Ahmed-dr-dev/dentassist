'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function PatientDashboardPage() {
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
      if (data.user.role !== 'patient') {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboards/patient" className="text-xl font-bold text-white">
                {t('common.appName')} - {t('dashboard.patient')}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <span className="text-gray-300">{user?.fullName}</span>
              <Link
                href="/api/auth/logout"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
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
          <h1 className="text-3xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-400">{t('common.welcome')}, {user?.fullName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboards/patient/appointments/request"
            className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-blue-600/50 transition cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">{t('appointments.request')}</h3>
            <p className="text-blue-100">{t('dashboard.reserveNew')}</p>
          </Link>

          <Link
            href="/dashboards/patient/appointments"
            className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-purple-600/50 transition cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">{t('appointments.myAppointments')}</h3>
            <p className="text-purple-100">{t('dashboard.trackAppointments')}</p>
          </Link>

          <Link
            href="/dashboards/patient/prescriptions"
            className="bg-gradient-to-br from-green-600 to-green-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-green-600/50 transition cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">{t('prescriptions.title')}</h3>
            <p className="text-green-100">{t('prescriptions.view')}</p>
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <Link
            href="/dashboards/patient/profile"
            className="flex items-center justify-between text-white hover:text-blue-400 transition"
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">{t('profile.title')}</h3>
              <p className="text-gray-400 text-sm">{t('dashboard.managePersonalInfo')}</p>
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
