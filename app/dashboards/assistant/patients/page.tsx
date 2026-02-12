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
  const [sortBy, setSortBy] = useState<'name' | 'total' | 'completed' | 'upcoming'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

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
    list.sort((a, b) => {
      let compareA: string | number, compareB: string | number
      if (sortBy === 'name') {
        compareA = (a.full_name || '').toLowerCase()
        compareB = (b.full_name || '').toLowerCase()
      } else if (sortBy === 'total') {
        compareA = a.totalAppointments ?? 0
        compareB = b.totalAppointments ?? 0
      } else if (sortBy === 'completed') {
        compareA = a.completedAppointments ?? 0
        compareB = b.completedAppointments ?? 0
      } else {
        compareA = a.upcomingAppointments ?? 0
        compareB = b.upcomingAppointments ?? 0
      }
      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [patients, searchQuery, sortBy, sortOrder])

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

        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-lg placeholder-gray-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'total' | 'completed' | 'upcoming')}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg"
            >
              <option value="name">{t('patients.sortByName')}</option>
              <option value="total">{t('patients.sortByTotalRdv')}</option>
              <option value="completed">{t('patients.sortByCompleted')}</option>
              <option value="upcoming">{t('patients.sortByUpcoming')}</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <span className="text-gray-600 text-sm">{filteredPatients.length} {t('patients.patientsCount')}</span>
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
                <p className="text-gray-600 text-sm mb-4">{patient.email}</p>
                {patient.phone && (
                  <p className="text-gray-600 text-sm mb-4">📞 {patient.phone}</p>
                )}
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total: </span>
                    <span className="text-gray-900">{patient.totalAppointments || 0}</span>
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
