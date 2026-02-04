'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'

export default function AssistantAppointmentsPage() {
  const { t } = useI18n()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
  const [stats, setStats] = useState({ confirmedCount: 0, remainingQuota: 30 })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'patient'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchAppointments()
  }, [period])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/doctor/list?period=${period}`)
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      setAppointments(data.appointments || [])
      setStats({ confirmedCount: data.confirmedCount || 0, remainingQuota: data.remainingQuota || 0 })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]
    if (statusFilter !== 'all') filtered = filtered.filter(apt => apt.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(apt => {
        const patient = apt.patient as any
        return (patient?.full_name || '').toLowerCase().includes(q) ||
          (patient?.email || '').toLowerCase().includes(q) ||
          (patient?.phone || '').toLowerCase().includes(q) ||
          (apt.reason || '').toLowerCase().includes(q)
      })
    }
    filtered.sort((a, b) => {
      let compareA: any, compareB: any
      if (sortBy === 'date') {
        compareA = a.confirmed_date_time || a.requested_date_time
        compareB = b.confirmed_date_time || b.requested_date_time
      } else if (sortBy === 'status') {
        compareA = a.status
        compareB = b.status
      } else {
        const pa = a.patient as any
        const pb = b.patient as any
        compareA = (pa?.full_name || '').toLowerCase()
        compareB = (pb?.full_name || '').toLowerCase()
      }
      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return filtered
  }, [appointments, searchQuery, statusFilter, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-green-500/20 text-green-300 border-green-500',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
      rejected: 'bg-red-500/20 text-red-300 border-red-500',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500',
      cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500'
    }
    return map[status] || 'bg-gray-500/20 text-gray-300 border-gray-500'
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      confirmed: t('appointments.confirmed'),
      pending: t('appointments.pending'),
      rejected: t('appointments.rejected'),
      completed: t('appointments.completed'),
      cancelled: t('appointments.cancelled')
    }
    return map[status] || status
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const periodText: Record<string, string> = {
    day: t('appointments.today'),
    week: t('appointments.thisWeek'),
    month: t('appointments.thisMonth')
  }

  const statusCounts = useMemo(() => ({
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    rejected: appointments.filter(a => a.status === 'rejected').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  }), [appointments])

  const getPaymentStatusText = (status: string) => {
    const map: Record<string, string> = {
      paid: t('payment.paid'),
      unpaid: t('payment.unpaid'),
      pending: t('payment.pending')
    }
    return map[status] || status
  }

  const getPaymentStatusColor = (status: string) => {
    const map: Record<string, string> = {
      paid: 'bg-green-500/20 text-green-300 border-green-500',
      unpaid: 'bg-red-500/20 text-red-300 border-red-500',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500'
    }
    return map[status] || 'bg-gray-500/20 text-gray-300 border-gray-500'
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
              <span className="text-gray-400">/ {t('appointments.list')}</span>
            </div>
            <Link href="/dashboards/assistant" className="flex items-center text-gray-300 hover:text-white">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">{t('appointments.list')}</h1>

        <div className="flex gap-2 mb-6">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-lg transition font-medium ${
                period === p ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {periodText[p] || p}
            </button>
          ))}
        </div>

        {period === 'day' && (
          <div className="mb-6 p-5 bg-amber-500/20 border border-amber-500/50 rounded-xl">
            <p className="text-amber-200 text-sm">{stats.confirmedCount} / 30 {t('appointments.confirmed')}</p>
            <p className="text-white font-bold">{stats.remainingQuota} {t('appointments.remaining')}</p>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg"
          />
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg"
            >
              <option value="all">{t('appointments.filterAll')} ({statusCounts.all})</option>
              <option value="confirmed">{t('appointments.confirmed')} ({statusCounts.confirmed})</option>
              <option value="pending">{t('appointments.pending')} ({statusCounts.pending})</option>
              <option value="completed">{t('appointments.completed')} ({statusCounts.completed})</option>
              <option value="rejected">{t('appointments.rejected')} ({statusCounts.rejected})</option>
              <option value="cancelled">{t('appointments.cancelled')} ({statusCounts.cancelled})</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'patient')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg"
            >
              <option value="date">{t('appointments.date')}</option>
              <option value="status">{t('appointments.status')}</option>
              <option value="patient">{t('appointments.sortBy.patient')}</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">{error}</div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400">
              {searchQuery || statusFilter !== 'all' ? t('common.noMatch') : t('appointments.noAppointmentsPeriod')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.map((appointment) => {
              const patient = appointment.patient as any
              const confirmedDt = appointment.confirmed_date_time ? formatDateTime(appointment.confirmed_date_time) : null
              const requestedDt = appointment.requested_date_time ? formatDateTime(appointment.requested_date_time) : null
              return (
                <div key={appointment.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{patient?.full_name || '—'}</h3>
                      <p className="text-gray-400 text-sm">{patient?.email}</p>
                      {patient?.phone && <p className="text-gray-400 text-sm">📞 {patient.phone}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                    {confirmedDt ? (
                      <>
                        <p className="text-gray-400 text-xs">{confirmedDt.date}</p>
                        <p className="text-amber-400 font-semibold">{confirmedDt.time}</p>
                      </>
                    ) : requestedDt ? (
                      <>
                        <p className="text-gray-400 text-xs">{requestedDt.date}</p>
                        <p className="text-yellow-400 font-semibold">{requestedDt.time}</p>
                      </>
                    ) : null}
                  </div>
                  {appointment.reason && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{appointment.reason}</p>
                  )}
                  {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                    <p className={`text-xs px-2 py-1 rounded border inline-block ${getPaymentStatusColor(appointment.payment_status || 'pending')}`}>
                      {getPaymentStatusText(appointment.payment_status || 'pending')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
