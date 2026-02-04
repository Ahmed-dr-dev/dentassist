'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function AssistantPatientsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients/list')
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/assistant" className="text-xl font-bold text-white">
                {t('common.appName')} - {t('dashboard.assistant')}
              </Link>
              <span className="text-gray-400">/ {t('patients.list')}</span>
            </div>
            <Link href="/dashboards/assistant" className="flex items-center text-gray-300 hover:text-white">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">{t('patients.title')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">{error}</div>
        )}

        {patients.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">{t('patients.noPatients')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboards/assistant/patients/${patient.id}`}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition cursor-pointer border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-2">{patient.full_name}</h3>
                <p className="text-gray-400 text-sm mb-4">{patient.email}</p>
                {patient.phone && (
                  <p className="text-gray-400 text-sm mb-4">📞 {patient.phone}</p>
                )}
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total: </span>
                    <span className="text-white">{patient.totalAppointments || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('appointments.completed')}: </span>
                    <span className="text-green-400">{patient.completedAppointments || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('appointments.confirmed')}: </span>
                    <span className="text-blue-400">{patient.upcomingAppointments || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
