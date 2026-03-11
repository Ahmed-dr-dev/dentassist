'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'

type PeriodFilter = 'today' | 'week' | 'month' | 'all'
type TypeFilter = 'all' | 'rdv' | 'control'

export default function DoctorAppointmentsListPage() {
  const { t, language } = useI18n()
  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar' : 'en-US'
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/appointments/doctor/list?period=all')
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()

      const rdvs = (data.appointments || []).map((apt: any) => ({
        ...apt,
        kind: 'rdv' as const,
      }))

      const controlRes = await fetch('/api/control-dates/doctor/list')
      if (!controlRes.ok) throw new Error('Failed to load')
      const controlData = await controlRes.json()
      const controls = (controlData.controlDates || []).map((c: any) => ({
        id: c.id,
        kind: 'control' as const,
        status: 'confirmed',
        control_date_time: c.control_date_time,
        reason: c.notes,
        patient: c.patient,
      }))

      setAppointments([...rdvs, ...controls])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentDate = (apt: any) => {
    const t = apt.confirmed_date_time || apt.requested_date_time || apt.control_date_time
    return t ? new Date(t) : null
  }

  const isToday = (d: Date) => {
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }

  const isInWeek = (d: Date) => {
    const now = new Date()
    const start = new Date(now)
    const dayOfWeek = start.getDay()
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return d >= start && d <= end
  }

  const isInMonth = (d: Date) => {
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }

  const filteredAndSorted = useMemo(() => {
    let list = [...appointments]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(apt => {
        const patient = apt.patient as any
        return (patient?.full_name || '').toLowerCase().includes(q) ||
          (patient?.email || '').toLowerCase().includes(q) ||
          (patient?.phone || '').toLowerCase().includes(q) ||
          (apt.reason || '').toLowerCase().includes(q)
      })
    }

    if (periodFilter !== 'all') {
      list = list.filter(apt => {
        const d = getAppointmentDate(apt)
        if (!d) return false
        if (periodFilter === 'today') return isToday(d)
        if (periodFilter === 'week') return isInWeek(d)
        if (periodFilter === 'month') return isInMonth(d)
        return true
      })
    }

    if (typeFilter !== 'all') {
      list = list.filter(apt => {
        const kind = apt.kind || 'rdv'
        if (typeFilter === 'rdv') return kind === 'rdv'
        if (typeFilter === 'control') return kind === 'control'
        return true
      })
    }

    list.sort((a, b) => {
      const dateA = getAppointmentDate(a)?.getTime() ?? 0
      const dateB = getAppointmentDate(b)?.getTime() ?? 0
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
      const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1
      const aIsToday = dateA >= todayStart && dateA <= todayEnd
      const bIsToday = dateB >= todayStart && dateB <= todayEnd
      if (aIsToday && !bIsToday) return -1
      if (!aIsToday && bIsToday) return 1
      return dateA - dateB
    })

    return list
  }, [appointments, searchQuery, periodFilter, typeFilter])

  const statusLabel: Record<string, string> = {
    confirmed: 'Confirmé',
    pending: 'En attente',
    completed: 'Terminé',
    rejected: 'Rejeté',
    cancelled: 'Annulé',
    control: 'Contrôle',
  }

  const statusClass: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    completed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
    control: 'bg-purple-100 text-purple-800',
  }

  const formatRow = (apt: any) => {
    const d = getAppointmentDate(apt)
    const dateStr = d ? d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'
    const timeStr = d ? d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '—'
    const patient = apt.patient as any
    const kind = apt.kind === 'control' ? 'control' : 'rdv'
    return {
      name: patient?.full_name || 'Patient',
      dateStr,
      timeStr,
      status: apt.status,
      kind,
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
              <span className="text-gray-500">/ {t('appointments.list')}</span>
            </div>
            <Link href="/dashboards/doctor" className="text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('appointments.list')}</h1>
        <p className="text-gray-600 text-sm mb-6">{t('doctor.rdvReadOnly')}</p>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'today' as const, label: t('income.today') },
              { value: 'week' as const, label: t('income.thisWeek') },
              { value: 'month' as const, label: t('income.thisMonth') },
              { value: 'all' as const, label: t('appointments.all') }
            ]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriodFilter(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${periodFilter === value ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
            >
              <option value="all">{t('appointments.filterTypeAll')}</option>
              <option value="rdv">{t('appointments.filterTypeRdv')}</option>
              <option value="control">{t('appointments.filterTypeControl')}</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        <div className="text-sm text-black font-bold mb-4 flex flex-col gap-0.5">
          <span>{filteredAndSorted.filter(a => a.kind === 'rdv').length} {t('appointments.rdvShort')}</span>
          <span>{filteredAndSorted.filter(a => a.kind === 'control').length} {t('appointments.controlShort')}</span>
        </div>

        {filteredAndSorted.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-600">
            {searchQuery || periodFilter !== 'all' ? t('common.noMatch') : t('appointments.noAppointments')}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:px-6">
                    {t('certificat.patientName')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:px-6">
                    {t('appointments.date')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:px-6">
                    {t('appointments.time')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:px-6">
                    {t('appointments.type')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:px-6">
                    {t('appointments.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAndSorted.map((apt) => {
                  const row = formatRow(apt)
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 sm:px-6">
                        <p className="font-medium text-gray-900 truncate">{row.name}</p>
                        {apt.reason && (
                          <p className="text-sm text-gray-500 truncate max-w-xs mt-0.5">{apt.reason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-gray-700">{row.dateStr}</td>
                      <td className="px-4 py-3 sm:px-6 text-gray-700 tabular-nums">{row.timeStr}</td>
                      <td className="px-4 py-3 sm:px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {row.kind === 'control' ? t('appointments.controlShort') : t('appointments.rdvShort')}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass[row.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel[row.status] || row.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
