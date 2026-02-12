'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function AssistantPatientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { t, locale } = useI18n()
  const patientId = params.id as string
  const [patient, setPatient] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [controlDates, setControlDates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [controlDate, setControlDate] = useState('')
  const [controlTime, setControlTime] = useState('')
  const [controlNotes, setControlNotes] = useState('')
  const [controlSubmitting, setControlSubmitting] = useState(false)
  const [controlSuccess, setControlSuccess] = useState('')

  useEffect(() => {
    if (patientId) fetchPatientDetails()
  }, [patientId])

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      setPatient(data.patient)
      setAppointments(data.appointments || [])
      setPrescriptions(data.prescriptions || [])
      setControlDates(data.controlDates || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loc = locale || 'fr-FR'

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(loc, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
    }
  }

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

  const getPaymentStatusText = (status: string) => {
    const map: Record<string, string> = {
      paid: t('payment.paid'),
      unpaid: t('payment.unpaid'),
      pending: t('payment.pending')
    }
    return map[status || 'pending'] || status
  }

  const getPaymentStatusColor = (status: string) => {
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 border-green-300',
      unpaid: 'bg-red-100 text-red-800 border-red-300',
      pending: 'bg-amber-100 text-amber-800 border-amber-300'
    }
    return map[status || 'pending'] || 'bg-gray-100 text-gray-600 border-gray-300'
  }

  const handleSetControlDate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!controlDate || !controlTime) return
    setControlSubmitting(true)
    setControlSuccess('')
    setError('')
    try {
      const controlDateTime = new Date(`${controlDate}T${controlTime}`).toISOString()
      const response = await fetch('/api/control-dates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          controlDateTime,
          notes: controlNotes || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('appointments.loadError'))
      setControlSuccess(t('controls.setSuccess'))
      setControlDate('')
      setControlTime('')
      setControlNotes('')
      fetchPatientDetails()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setControlSubmitting(false)
    }
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
              <span className="text-gray-600">/ {t('patients.patientDetails')}</span>
            </div>
            <Link href="/dashboards/assistant/patients" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">{error}</div>
        )}

        {patient && (
          <>
            {/* Profile */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{patient.full_name}</h1>
              <div className="space-y-2 text-gray-600">
                <p>📧 {patient.email}</p>
                {patient.phone && <p>📞 {patient.phone}</p>}
                <p className="text-gray-600 text-sm">
                  {t('common.createdAt')} {new Date(patient.created_at).toLocaleDateString(loc)}
                </p>
              </div>
            </div>

            {/* Control dates */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('controls.title')}</h2>
              {controlSuccess && (
                <p className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">{controlSuccess}</p>
              )}
              <form onSubmit={handleSetControlDate} className="flex flex-wrap items-end gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('appointments.date')}</label>
                  <input
                    type="date"
                    required
                    value={controlDate}
                    onChange={(e) => setControlDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('appointments.time')}</label>
                  <input
                    type="time"
                    required
                    value={controlTime}
                    onChange={(e) => setControlTime(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-gray-600 mb-1">{t('controls.notesOptional')}</label>
                  <input
                    type="text"
                    value={controlNotes}
                    onChange={(e) => setControlNotes(e.target.value)}
                    placeholder={t('controls.notesPlaceholder')}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={controlSubmitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {controlSubmitting ? '...' : t('common.save')}
                </button>
              </form>
              {controlDates.length > 0 ? (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-gray-600 text-sm font-medium mb-2">{t('controls.upcoming')} ({controlDates.length})</p>
                  <ul className="space-y-2">
                    {controlDates.map((c: any) => {
                      const dt = formatDateTime(c.control_date_time)
                      const isPast = new Date(c.control_date_time) < new Date()
                      return (
                        <li
                          key={c.id}
                          className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${isPast ? 'bg-gray-100 text-gray-600' : 'bg-cyan-50 text-cyan-800 border border-cyan-200'}`}
                        >
                          <span>{dt.date} {t('common.at')} {dt.time}</span>
                          {c.notes && <span className="text-gray-600 truncate max-w-[200px]">{c.notes}</span>}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">{t('controls.noControls')}</p>
              )}
            </div>

            {/* Appointments (RDV) */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('patients.appointmentHistory')} ({appointments.length})
              </h2>
              {appointments.length === 0 ? (
                <p className="text-gray-600">{t('appointments.noAppointments')}</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const dateTime = appointment.confirmed_date_time
                      ? formatDateTime(appointment.confirmed_date_time)
                      : formatDateTime(appointment.requested_date_time)
                    return (
                      <div key={appointment.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                          <div>
                            <p className="text-gray-900 font-medium">{dateTime.date}</p>
                            <p className="text-gray-600">{dateTime.time}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                            {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(appointment.payment_status || 'pending')}`}>
                                {getPaymentStatusText(appointment.payment_status || 'pending')}
                              </span>
                            )}
                          </div>
                        </div>
                        {appointment.reason && (
                          <p className="text-gray-600 mb-2">{t('appointments.reason')}: {appointment.reason}</p>
                        )}
                        {appointment.rejection_reason && (
                          <p className="text-red-300 text-sm mb-2">{appointment.rejection_reason}</p>
                        )}
                        {appointment.notes && (
                          <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                            <p className="text-blue-300 text-sm mb-1">Notes:</p>
                            <p className="text-gray-600 text-sm">{appointment.notes}</p>
                          </div>
                        )}
                        {appointment.observations && (
                          <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                            <p className="text-purple-300 text-sm mb-1">Observations:</p>
                            <p className="text-gray-600 text-sm">{appointment.observations}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Prescriptions (Ordonnances) */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('patients.prescriptions')} ({prescriptions.length})
              </h2>
              {prescriptions.length === 0 ? (
                <p className="text-gray-600">{t('prescriptions.noPrescriptions')}</p>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <p className="text-gray-900 font-medium mb-2">{prescription.file_name}</p>
                      {prescription.description && (
                        <p className="text-gray-600 text-sm mb-2">{prescription.description}</p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {new Date(prescription.created_at).toLocaleDateString(loc)}
                      </p>
                      <a
                        href={prescription.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-sm"
                      >
                        {t('payment.viewFile')}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
