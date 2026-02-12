'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function AssistantDashboardPage() {
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
      if (data.user.role !== 'assistant') {
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
              <Link href="/dashboards/assistant" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.assistant')}
              </Link>
            </div>
            <div className="flex items-center gap-4">
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

        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('dashboard.assistantTasksTitle')}</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• {t('dashboard.assistantTaskAcceptDecline')}</li>
            <li>• {t('dashboard.assistantTaskTariffs')}</li>
            <li>• {t('dashboard.assistantTaskPaymentStatus')}</li>
            <li>• {t('dashboard.assistantTaskRdvList')}</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Link
            href="/dashboards/assistant/appointments"
            className="bg-gradient-to-br from-amber-600 to-amber-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-amber-600/50 transition cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">{t('appointments.list')}</h3>
            <p className="text-amber-100">{t('dashboard.assistantViewAppointments')}</p>
          </Link>

          <Link
            href="/dashboards/assistant/patients"
            className="bg-gradient-to-br from-cyan-600 to-cyan-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-cyan-600/50 transition cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">{t('patients.title')}</h3>
            <p className="text-cyan-100">{t('dashboard.assistantViewPatients')}</p>
          </Link>

          <Link
            href="/dashboards/assistant/tariffs"
            className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-emerald-600/50 transition cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">{t('tariffs.title')}</h3>
            <p className="text-emerald-100">{t('dashboard.assistantManageTariffs')}</p>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <Link
            href="/dashboards/assistant/profile"
            className="flex items-center justify-between text-gray-900 hover:text-blue-600 transition"
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">{t('profile.title')}</h3>
              <p className="text-gray-500 text-sm">{t('dashboard.managePersonalInfo')}</p>
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
