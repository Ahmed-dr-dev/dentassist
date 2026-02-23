'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function AssistantPatientsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredPatients = useMemo(() => {
    let list = [...patients]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          (p.full_name || '').toLowerCase().includes(q) ||
          (p.email || '').toLowerCase().includes(q) ||
          (p.phone || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', undefined, { sensitivity: 'base' }))
    return list
  }, [patients, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/assistant" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.assistant')}
              </Link>
              <span className="text-gray-600">/ {t('patients.list')}</span>
            </div>
            <Link href="/dashboards/assistant" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('patients.title')}</h1>

        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.search')}</label>
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm placeholder-gray-500"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <p className="text-sm text-gray-500">{filteredPatients.length} {t('patients.patientsCount')}</p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  {t('appointments.clearFilters')}
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">{error}</div>
        )}

        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-600">{searchQuery ? t('common.noMatch') : t('patients.noPatients')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboards/assistant/patients/${patient.id}`}
                className="bg-white rounded-xl p-6 hover:bg-gray-50 transition cursor-pointer border border-gray-200 shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{patient.full_name}</h3>
                <p className="text-gray-600 text-sm mb-1">{patient.email}</p>
                {patient.phone && (
                  <p className="text-gray-600 text-sm mb-4">📞 {patient.phone}</p>
                )}
                {!patient.phone && <div className="mb-4" />}
                <div className="text-sm">
                  <p className="text-gray-500 font-medium mb-2">{t('patients.rdvStatus')}</p>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-gray-500">{t('patients.rdvTotal')}: </span>
                      <span className="text-gray-900">{patient.totalAppointments || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('appointments.completed')}: </span>
                      <span className="text-green-600">{patient.completedAppointments || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('appointments.confirmed')}: </span>
                      <span className="text-blue-600">{patient.upcomingAppointments || 0}</span>
                    </div>
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
