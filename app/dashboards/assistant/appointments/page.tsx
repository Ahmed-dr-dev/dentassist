'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'

export default function AssistantAppointmentsPage() {
  const { t, language } = useI18n()
  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar' : 'en-US'
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [filterDate, setFilterDate] = useState('')
  const [filterTime, setFilterTime] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null)
  const [rejectModalId, setRejectModalId] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedAlternatives, setSelectedAlternatives] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/appointments/doctor/list?period=all')
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]
    if (statusFilter !== 'all') filtered = filtered.filter(apt => apt.status === statusFilter)
    if (filterTime) {
      const [h, m] = filterTime.split(':').map(Number)
      filtered = filtered.filter(apt => {
        const d = apt.confirmed_date_time || apt.requested_date_time
        if (!d) return false
        const dt = new Date(d)
        return dt.getHours() === h && dt.getMinutes() === m
      })
    }
    if (filterDate) {
      const dayStart = new Date(filterDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(filterDate)
      dayEnd.setHours(23, 59, 59, 999)
      filtered = filtered.filter(apt => {
        const d = apt.confirmed_date_time || apt.requested_date_time
        if (!d) return false
        const t = new Date(d).getTime()
        return t >= dayStart.getTime() && t <= dayEnd.getTime()
      })
    }
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
      const dateA = a.confirmed_date_time || a.requested_date_time || ''
      const dateB = b.confirmed_date_time || b.requested_date_time || ''
      return dateB.localeCompare(dateA)
    })
    return filtered
  }, [appointments, searchQuery, statusFilter, filterDate, filterTime])

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      pending: 'bg-amber-100 text-amber-800 border-amber-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-300'
    }
    return map[status] || 'bg-gray-100 text-gray-600 border-gray-300'
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
      date: date.toLocaleDateString(locale, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    }
  }

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'reject') => {
    if (action === 'reject') {
      setRejectModalId(appointmentId)
      setSelectedAlternatives([])
      setRejectionReason('')
      setError('')
      setLoadingSlots(true)
      setAvailableSlots([])
      try {
        const res = await fetch('/api/appointments/available-dates?days=14')
        const data = await res.json()
        if (res.ok && data.availableDates) setAvailableSlots(data.availableDates)
        else setAvailableSlots([])
      } catch {
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
      return
    }
    setProcessingId(appointmentId)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/appointments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, action })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('appointments.loadError'))
      setSuccess(data.message || t('appointments.confirmSuccess'))
      setTimeout(() => { fetchAppointments(); setSuccess('') }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const toggleAlternative = (iso: string) => {
    setSelectedAlternatives(prev =>
      prev.includes(iso) ? prev.filter(d => d !== iso) : [...prev, iso]
    )
  }

  const handleRejectWithAlternatives = async () => {
    if (!rejectModalId) return
    if (selectedAlternatives.length === 0) {
      setError(t('appointments.selectAtLeastOneAlternative'))
      return
    }
    setRejectSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/appointments/reject-with-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: rejectModalId,
          rejectionReason: rejectionReason || null,
          alternativeDates: selectedAlternatives,
          suggestNearestDoctor: false
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('appointments.loadError'))
      setSuccess(data.message || t('appointments.rejectSuccessWithAlternatives'))
      setRejectModalId(null)
      setSelectedAlternatives([])
      setRejectionReason('')
      setTimeout(() => { fetchAppointments(); setSuccess('') }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRejectSubmitting(false)
    }
  }

  const handlePaymentStatusUpdate = async (appointmentId: string, paymentStatus: string) => {
    setUpdatingPaymentId(appointmentId)
    setError('')
    try {
      const response = await fetch('/api/appointments/payment-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, paymentStatus })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('appointments.loadError'))
      fetchAppointments()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingPaymentId(null)
    }
  }

  const handleComplete = async (appointmentId: string) => {
    setProcessingId(appointmentId)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/appointments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('appointments.loadError'))
      setSuccess(data.message || t('appointments.completed'))
      setTimeout(() => { fetchAppointments(); setSuccess('') }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReopen = async (appointmentId: string) => {
    setProcessingId(appointmentId)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/appointments/reopen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('appointments.loadError'))
      setSuccess(data.message || 'Reopened')
      setTimeout(() => { fetchAppointments(); setSuccess('') }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessingId(null)
    }
  }

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
      paid: 'bg-green-100 text-green-800 border-green-300',
      unpaid: 'bg-red-100 text-red-800 border-red-300',
      pending: 'bg-amber-100 text-amber-800 border-amber-300'
    }
    return map[status] || 'bg-gray-100 text-gray-600 border-gray-300'
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
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/assistant" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.assistant')}
              </Link>
              <span className="text-gray-500">/ {t('appointments.list')}</span>
            </div>
            <Link href="/dashboards/assistant" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('appointments.list')}</h1>

        {/* Simple filters */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointments.time')}</label>
              <input
                type="time"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointments.date')}</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointments.status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm"
              >
                <option value="all">{t('common.all')}</option>
                <option value="pending">{t('appointments.pending')}</option>
                <option value="confirmed">{t('appointments.confirmed')}</option>
                <option value="completed">{t('appointments.completed')}</option>
                <option value="rejected">{t('appointments.rejected')}</option>
                <option value="cancelled">{t('appointments.cancelled')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.search')}</label>
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm placeholder-gray-500"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredAppointments.length} {t('appointments.filterResultCount')}
            </p>
            {(filterTime || filterDate || statusFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => { setFilterTime(''); setFilterDate(''); setStatusFilter('all'); setSearchQuery(''); }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                {t('appointments.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || filterDate || filterTime
                ? t('common.noMatch')
                : t('appointments.noAppointments')}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredAppointments.map((appointment) => {
              const patient = appointment.patient as any
              const confirmedDt = appointment.confirmed_date_time ? formatDateTime(appointment.confirmed_date_time) : null
              const requestedDt = appointment.requested_date_time ? formatDateTime(appointment.requested_date_time) : null
              return (
                <li key={appointment.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{patient?.full_name || '—'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{patient?.email}</p>
                      {confirmedDt ? (
                        <p className="text-sm text-gray-700 mt-1">
                          {confirmedDt.date} · {confirmedDt.time}
                        </p>
                      ) : requestedDt ? (
                        <p className="text-sm text-amber-700 mt-1">
                          {requestedDt.date} · {requestedDt.time}
                        </p>
                      ) : null}
                      {appointment.reason && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{appointment.reason}</p>
                      )}
                      {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium border ${getPaymentStatusColor(appointment.payment_status || 'pending')}`}>
                          {getPaymentStatusText(appointment.payment_status || 'pending')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                            disabled={processingId === appointment.id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            {processingId === appointment.id ? '...' : t('appointments.accept')}
                          </button>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                            disabled={processingId === appointment.id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            {t('appointments.reject')}
                          </button>
                        </>
                      )}
                      {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                        <>
                          <label
                            className={`flex items-center gap-2 select-none ${(appointment.status === 'confirmed' && (appointment.payment_status || 'pending') !== 'paid') ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            title={(appointment.status === 'confirmed' && (appointment.payment_status || 'pending') !== 'paid') ? t('appointments.completeOnlyWhenPaid') : undefined}
                          >
                            <input
                              type="checkbox"
                              checked={appointment.status === 'completed'}
                              disabled={processingId === appointment.id || (appointment.status === 'confirmed' && (appointment.payment_status || 'pending') !== 'paid')}
                              onChange={() => {
                                if (appointment.status === 'completed') handleReopen(appointment.id)
                                else handleComplete(appointment.id)
                              }}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm font-medium text-gray-700">{t('appointments.completed')}</span>
                          </label>
                          {appointment.status === 'confirmed' && (appointment.payment_status || 'pending') === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePaymentStatusUpdate(appointment.id, 'paid')}
                                disabled={updatingPaymentId === appointment.id}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                              >
                                {updatingPaymentId === appointment.id ? '...' : t('payment.markAsPaid')}
                              </button>
                              <button
                                onClick={() => handlePaymentStatusUpdate(appointment.id, 'unpaid')}
                                disabled={updatingPaymentId === appointment.id}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                              >
                                {t('payment.unpaidButton')}
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* Reject with alternatives modal */}
        {rejectModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{t('appointments.rejectWithAlternatives')}</h2>
                <p className="text-gray-600 text-sm mt-1">{t('appointments.selectAlternativesHint')}</p>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <label className="block text-gray-600 text-sm font-medium mb-2">{t('appointments.rejectionReasonOptional')}</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t('appointments.rejectionReasonPlaceholder')}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm mb-4"
                />
                <label className="block text-gray-600 text-sm font-medium mb-2">{t('appointments.availableSlotsNextDays')}</label>
                {loadingSlots ? (
                  <p className="text-gray-600 text-sm py-4">{t('common.loading')}</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-600 text-sm py-4">{t('appointments.noAvailableSlots')}</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableSlots.map((iso) => {
                      const d = new Date(iso)
                      const label = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      return (
                        <label key={iso} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAlternatives.includes(iso)}
                            onChange={() => toggleAlternative(iso)}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-gray-900 text-sm">{label}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
                {selectedAlternatives.length > 0 && (
                  <p className="text-amber-700 text-xs mt-2">{selectedAlternatives.length} {t('appointments.selectedSlots')}</p>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setRejectModalId(null); setError(''); setSelectedAlternatives([]); setRejectionReason('') }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleRejectWithAlternatives}
                  disabled={rejectSubmitting || loadingSlots || selectedAlternatives.length === 0}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {rejectSubmitting ? t('common.loading') : t('appointments.rejectAndSendAlternatives')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
