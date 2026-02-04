'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar' }

export default function AppointmentsPage() {
  const router = useRouter()
  const { t, language } = useI18n()
  const locale = localeMap[language] || 'fr-FR'
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments/list')
      if (!response.ok) {
        throw new Error(t('appointments.loadError'))
      }
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500'
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500'
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-300 border-gray-500'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return t('appointments.confirmed')
      case 'pending': return t('appointments.pending')
      case 'rejected': return t('appointments.rejected')
      case 'completed': return t('appointments.completed')
      case 'cancelled': return t('appointments.cancelled')
      default: return status
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    }
  }

  const handleCancel = async (appointmentId: string) => {
    const reason = prompt(t('appointments.cancelPrompt'))
    if (reason === null) return

    setCancellingId(appointmentId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          reason: reason || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('appointments.cancelError'))
      }

      setSuccess(t('appointments.cancelSuccess'))
      fetchAppointments()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCancellingId(null)
    }
  }

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-500/20 text-green-300 border-green-500'
      case 'unpaid': return 'bg-red-500/20 text-red-300 border-red-500'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500'
    }
  }

  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return t('payment.paid')
      case 'unpaid': return t('payment.unpaid')
      default: return t('payment.pending')
    }
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
              <Link href="/dashboards/patient" className="text-xl font-bold text-white">
                {t('common.appName')}
              </Link>
              <span className="text-gray-400">/ {t('appointments.myAppointments')}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboards/patient/appointments/request"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
              >
                {t('appointments.newRdv')}
              </Link>
              <Link
                href="/dashboards/patient"
                className="text-gray-300 hover:text-white"
              >
                {t('common.back')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">{t('appointments.myAppointments')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
            {success}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">{t('appointments.noAppointmentsFound')}</p>
            <Link
              href="/dashboards/patient/appointments/request"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
            >
              {t('appointments.requestAppointment')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const confirmedDateTime = appointment.confirmed_date_time
                ? formatDateTime(appointment.confirmed_date_time)
                : null
              const requestedDateTime = appointment.requested_date_time
                ? formatDateTime(appointment.requested_date_time)
                : null
              const doctor = appointment.doctor as any

              return (
                <div key={appointment.id} className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Dr. {doctor?.full_name}
                      </h3>
                      {doctor?.specialty && (
                        <p className="text-gray-400">{doctor.specialty}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  {confirmedDateTime && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-1">{t('appointments.confirmedDateTimeLabel')} :</p>
                      <p className="text-white font-medium">{confirmedDateTime.date}</p>
                      <p className="text-white font-medium">{confirmedDateTime.time}</p>
                    </div>
                  )}

                  {!confirmedDateTime && requestedDateTime && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-1">{t('appointments.requestedDateTimeLabel')} :</p>
                      <p className="text-white font-medium">{requestedDateTime.date}</p>
                      <p className="text-white font-medium">{requestedDateTime.time}</p>
                    </div>
                  )}

                  {appointment.status === 'confirmed' && appointment.queuePosition && (
                    <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-sm mb-2">{t('appointments.queueTitle')}</p>
                      <p className="text-white font-bold text-2xl mb-1">
                        {appointment.queuePosition}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {appointment.patientsBefore} {t('appointments.patientsBefore')}
                      </p>
                      {appointment.estimatedWaitMinutes && (
                        <p className="text-gray-400 text-sm mt-2">
                          {t('appointments.estimatedWait')} : {Math.floor(appointment.estimatedWaitMinutes / 60)}h{' '}
                          {appointment.estimatedWaitMinutes % 60}min
                        </p>
                      )}
                    </div>
                  )}

                  {appointment.rejection_reason && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-sm font-semibold mb-2">{t('appointments.rejectedTitle')}</p>
                      <p className="text-gray-300 text-sm mb-3">{appointment.rejection_reason}</p>
                      
                      {appointment.alternative_dates && appointment.alternative_dates.length > 0 && (
                        <div className="mt-3 mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-sm font-semibold mb-2">📅 {t('appointments.alternativeDatesSuggested')} :</p>
                          <div className="space-y-2">
                            {appointment.alternative_dates.slice(0, 5).map((dateStr: string, idx: number) => {
                              const date = new Date(dateStr)
                              const dateFormatted = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                              const timeFormatted = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
                              return (
                                <div key={idx} className="text-gray-300 text-sm">
                                  • {dateFormatted}{t('common.at')}{timeFormatted}
                                </div>
                              )
                            })}
                            {appointment.alternative_dates.length > 5 && (
                              <p className="text-gray-400 text-xs">{t('appointments.andMoreDates').replace('{count}', String(appointment.alternative_dates.length - 5))}</p>
                            )}
                          </div>
                          <Link
                            href="/dashboards/patient/appointments/request"
                            className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-sm"
                          >
                            {t('appointments.chooseOneOfThese')}
                          </Link>
                        </div>
                      )}

                      {appointment.suggested_dentist_name && (
                        <div className="mt-3 mb-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          <p className="text-orange-300 text-sm font-semibold mb-2">📍 {t('appointments.recommendedDentist')} :</p>
                          <div className="space-y-1">
                            <p className="text-white text-sm font-medium">{appointment.suggested_dentist_name}</p>
                            <p className="text-gray-300 text-sm">📍 {appointment.suggested_dentist_address}</p>
                            <p className="text-gray-300 text-sm">📞 {appointment.suggested_dentist_phone}</p>
                          </div>
                        </div>
                      )}

                      {!appointment.alternative_dates && !appointment.suggested_dentist_name && (
                        <div className="mt-3">
                          <Link
                            href="/dashboards/patient/appointments/request"
                            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-sm"
                          >
                            {t('appointments.requestNewRdv')}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {appointment.reason && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-1">Raison de la visite :</p>
                      <p className="text-gray-300">{appointment.reason}</p>
                    </div>
                  )}

                  {/* Payment status - for confirmed/completed */}
                  {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Statut du paiement:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(appointment.payment_status || 'pending')}`}>
                        {getPaymentStatusText(appointment.payment_status || 'pending')}
                      </span>
                    </div>
                  )}

                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition text-sm disabled:opacity-50"
                      >
                        {cancellingId === appointment.id ? t('appointments.cancelling') : t('appointments.cancelAppointment')}
                      </button>
                    </div>
                  )}

                  <div className="text-gray-500 text-xs mt-4">
                    {t('appointments.createdOn')} {new Date(appointment.created_at).toLocaleDateString(locale)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
