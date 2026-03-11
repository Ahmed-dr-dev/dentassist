'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'

export default function AssistantPatientsPage() {
  const { t } = useI18n()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [filterDate])

  const fetchPatients = async () => {
    setLoading(true)
    setError('')
    try {
      const url = filterDate ? `/api/patients/list?date=${encodeURIComponent(filterDate)}` : '/api/patients/list'
      const response = await fetch(url)
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
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/assistant" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.assistant')}
              </Link>
              <span className="text-gray-500">/ {t('patients.list')}</span>
            </div>
            <Link href="/dashboards/assistant" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('patients.title')}</h1>

        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.search')}</label>
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('patients.filterByRdvDate')}</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm"
                />
              </div>
              {(filterDate || searchQuery) && (
                <button
                  type="button"
                  onClick={() => { setFilterDate(''); setSearchQuery(''); }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {t('appointments.clearFilters')}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-black font-bold">{filteredPatients.length} {t('patients.patientsCount')}</p>
              {filterDate && (
                <p className="text-sm text-gray-600">{t('patients.rdvOnDate')}: {filterDate}</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">{error}</div>
        )}

        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-600">
            {searchQuery ? t('common.noMatch') : filterDate ? t('patients.noPatientsOnDate') : t('patients.noPatients')}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/dashboards/assistant/patients/${patient.id}`}
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
