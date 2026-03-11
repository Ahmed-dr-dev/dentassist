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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboards/doctor/patients/${patient.id}`}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition cursor-pointer"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{patient.full_name}</h3>
                <p className="text-gray-600 text-sm mb-1">{patient.email}</p>
                {patient.phone && (
                  <p className="text-gray-600 text-sm mb-4">📞 {patient.phone}</p>
                )}
                {!patient.phone && <div className="mb-4" />}
                <div className="flex flex-col gap-1 text-sm">
                  <div>
                    <span className="text-gray-500">{t('patients.rdvTotal')}: </span>
                    <span className="text-gray-900">{patient.totalAppointments ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('patients.rdvControl')}: </span>
                    <span className="text-gray-900">{patient.controlDatesCount ?? 0}</span>
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
