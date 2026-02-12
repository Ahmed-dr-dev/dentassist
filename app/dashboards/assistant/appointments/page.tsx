'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'

export default function AssistantAppointmentsPage() {
  const { t, locale } = useI18n()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'patient'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
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
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(apt => (apt.payment_status || 'pending') === paymentFilter)
    }
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      filtered = filtered.filter(apt => {
        const d = apt.confirmed_date_time || apt.requested_date_time
        return d && new Date(d) >= from
      })
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      filtered = filtered.filter(apt => {
        const d = apt.confirmed_date_time || apt.requested_date_time
        return d && new Date(d) <= to
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
  }, [appointments, searchQuery, statusFilter, paymentFilter, dateFrom, dateTo, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-green-500/20 text-green-300 border-green-500',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
      rejected: 'bg-red-500/20 text-red-300 border-red-500',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500',
      cancelled: 'bg-gray-500/20 text-gray-600 border-gray-500'
    }
    return map[status] || 'bg-gray-500/20 text-gray-600 border-gray-500'
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
    const loc = locale || 'fr-FR'
    return {
      date: date.toLocaleDateString(loc, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
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
    return map[status] || 'bg-gray-500/20 text-gray-600 border-gray-500'
  }

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
              <span className="text-gray-600">/ {t('appointments.list')}</span>
            </div>
            <Link href="/dashboards/assistant" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('appointments.list')}</h1>

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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg"
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
              className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg"
            >
              <option value="date">{t('appointments.date')}</option>
              <option value="status">{t('appointments.status')}</option>
              <option value="patient">{t('appointments.sortBy.patient')}</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-white"
              title={sortOrder === 'asc' ? t('appointments.sortOrder.asc') : t('appointments.sortOrder.desc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-2 bg-white hover:bg-gray-600 text-gray-600 rounded-lg text-sm font-medium"
            >
              {showAdvanced ? t('appointments.hideFilters') : t('appointments.advancedFilters')}
            </button>
          </div>

          {showAdvanced && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1">{t('appointments.dateFrom')}</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1">{t('appointments.dateTo')}</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1">{t('payment.status')}</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg"
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="paid">{t('payment.paid')}</option>
                  <option value="unpaid">{t('payment.unpaid')}</option>
                  <option value="pending">{t('payment.pending')}</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => { setDateFrom(''); setDateTo(''); setPaymentFilter('all'); }}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg text-sm"
              >
                {t('appointments.clearFilters')}
              </button>
            </div>
          )}

          <p className="text-gray-600 text-sm">
            {filteredAppointments.length} {t('appointments.filterResultCount')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">{success}</div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || dateFrom || dateTo
                ? t('common.noMatch')
                : t('appointments.noAppointments')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.map((appointment) => {
              const patient = appointment.patient as any
              const confirmedDt = appointment.confirmed_date_time ? formatDateTime(appointment.confirmed_date_time) : null
              const requestedDt = appointment.requested_date_time ? formatDateTime(appointment.requested_date_time) : null
              return (
                <div key={appointment.id} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{patient?.full_name || '—'}</h3>
                      <p className="text-gray-600 text-sm">{patient?.email}</p>
                      {patient?.phone && <p className="text-gray-600 text-sm">📞 {patient.phone}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  <div className="mb-4 p-3 bg-white/50 rounded-lg">
                    {confirmedDt ? (
                      <>
                        <p className="text-gray-600 text-xs">{confirmedDt.date}</p>
                        <p className="text-amber-400 font-semibold">{confirmedDt.time}</p>
                      </>
                    ) : requestedDt ? (
                      <>
                        <p className="text-gray-600 text-xs">{requestedDt.date}</p>
                        <p className="text-yellow-400 font-semibold">{requestedDt.time}</p>
                      </>
                    ) : null}
                  </div>
                  {appointment.reason && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{appointment.reason}</p>
                  )}
                  {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-600 text-xs font-medium mb-2">{t('payment.status')}</p>
                      <span className={`inline-block px-2 py-1 rounded border text-xs font-medium ${getPaymentStatusColor(appointment.payment_status || 'pending')}`}>
                        {getPaymentStatusText(appointment.payment_status || 'pending')}
                      </span>
                      {(appointment.payment_status || 'pending') === 'pending' && (
                        <div className="flex flex-wrap gap-2 mt-2">
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
                            {updatingPaymentId === appointment.id ? '...' : t('payment.unpaidButton')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {appointment.status === 'pending' && (
                    <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                        disabled={processingId === appointment.id}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {processingId === appointment.id ? '...' : t('appointments.accept')}
                      </button>
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                        disabled={processingId === appointment.id}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {t('appointments.reject')}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
                      const loc = locale || 'fr-FR'
                      const label = d.toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      return (
                        <label
                          key={iso}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAlternatives.includes(iso)}
                            onChange={() => toggleAlternative(iso)}
                            className="rounded border-gray-300 bg-white text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-gray-900 text-sm">{label}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
                {selectedAlternatives.length > 0 && (
                  <p className="text-amber-300 text-xs mt-2">{selectedAlternatives.length} {t('appointments.selectedSlots')}</p>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setRejectModalId(null); setError(''); setSelectedAlternatives([]); setRejectionReason('') }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-900 rounded-lg text-sm font-medium"
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
