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
              <Link href="/dashboards/doctor" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.doctor')}
              </Link>
              <span className="text-gray-500">/ {t('patients.list')}</span>
            </div>
            <Link href="/dashboards/doctor" className="text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/dashboards/doctor/patients/${patient.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 hover:bg-gray-50 transition"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{patient.full_name}</p>
                      <p className="text-sm text-gray-600 truncate">{patient.email}</p>
                      {patient.phone && (
                        <p className="text-sm text-gray-500">📞 {patient.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-6 text-sm shrink-0">
                      <span className="text-gray-500">
                        {t('patients.rdvTotal')}: <strong className="text-gray-900">{patient.totalAppointments ?? 0}</strong>
                      </span>
                      <span className="text-gray-500">
                        {t('patients.rdvControl')}: <strong className="text-gray-900">{patient.controlDatesCount ?? 0}</strong>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
