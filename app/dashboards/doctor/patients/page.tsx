'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

export default function DoctorPatientsPage() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/doctor" className="text-gray-600 hover:text-gray-900">
                {t('common.back')}
              </Link>
              <Link href="/dashboards/doctor" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.doctor')}
              </Link>
              <span className="text-gray-500">/ {t('patients.list')}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('patients.title')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {patients.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-600">
            {t('patients.noPatients')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient, idx) => {
              const schemes = [
                { bg: 'from-blue-600 to-blue-500', shadow: 'hover:shadow-blue-600/50' },
                { bg: 'from-teal-600 to-teal-500', shadow: 'hover:shadow-teal-600/50' },
                { bg: 'from-purple-600 to-purple-500', shadow: 'hover:shadow-purple-600/50' },
                { bg: 'from-emerald-600 to-emerald-500', shadow: 'hover:shadow-emerald-600/50' },
                { bg: 'from-cyan-600 to-cyan-500', shadow: 'hover:shadow-cyan-600/50' },
                { bg: 'from-indigo-600 to-indigo-500', shadow: 'hover:shadow-indigo-600/50' },
              ]
              const { bg, shadow } = schemes[idx % schemes.length]
              return (
                <Link
                  key={patient.id}
                  href={`/dashboards/doctor/patients/${patient.id}`}
                  className={`flex items-start gap-4 bg-gradient-to-br ${bg} rounded-xl p-6 text-white hover:shadow-lg ${shadow} transition cursor-pointer`}
                >
                  <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">{patient.full_name}</h3>
                    <p className="text-sm text-white/80 truncate">{patient.email}</p>
                    {patient.phone && (
                      <p className="text-sm text-white/80">{patient.phone}</p>
                    )}
                    <div className="flex gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-white/70">{t('patients.rdvTotal')}</span>
                        <span className="ml-1 font-bold">{patient.totalAppointments ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-white/70">{t('patients.rdvControl')}</span>
                        <span className="ml-1 font-bold">{patient.controlDatesCount ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
