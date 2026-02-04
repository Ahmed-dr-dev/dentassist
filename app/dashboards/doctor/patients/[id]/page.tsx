'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function PatientDetailsPage() {
  const router = useRouter()
  const params = useParams()
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
    if (patientId) {
      fetchPatientDetails()
    }
  }, [patientId])

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-300 border-green-500'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500'
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500'
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500'
      case 'cancelled': return 'bg-gray-500/20 text-gray-300 border-gray-500'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé'
      case 'pending': return 'En attente'
      case 'rejected': return 'Rejeté'
      case 'completed': return 'Terminé'
      case 'cancelled': return 'Annulé'
      default: return status
    }
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
      if (!response.ok) throw new Error(data.error || 'Erreur')
      setControlSuccess('Date de contrôle enregistrée. Le patient la verra sur son espace.')
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/doctor" className="text-xl font-bold text-white">
                DentAssist
              </Link>
              <span className="text-gray-400">/ Détails du patient</span>
            </div>
            <Link
              href="/dashboards/doctor/patients"
              className="flex items-center text-gray-300 hover:text-white"
            >
              Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {patient && (
          <>
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">{patient.full_name}</h1>
              <div className="space-y-2 text-gray-300">
                <p>📧 {patient.email}</p>
                {patient.phone && <p>📞 {patient.phone}</p>}
                <p className="text-gray-400 text-sm">
                  Patient depuis le {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Fixer une date de contrôle</h2>
              {controlSuccess && (
                <p className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">{controlSuccess}</p>
              )}
              <form onSubmit={handleSetControlDate} className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={controlDate}
                    onChange={(e) => setControlDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Heure</label>
                  <input
                    type="time"
                    required
                    value={controlTime}
                    onChange={(e) => setControlTime(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-gray-400 mb-1">Notes (optionnel)</label>
                  <input
                    type="text"
                    value={controlNotes}
                    onChange={(e) => setControlNotes(e.target.value)}
                    placeholder="Ex: contrôle après extraction"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={controlSubmitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {controlSubmitting ? '...' : 'Enregistrer'}
                </button>
              </form>
              {controlDates.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-gray-400 text-sm font-medium mb-2">Dates de contrôle enregistrées ({controlDates.length})</p>
                  <ul className="space-y-2">
                    {controlDates.map((c: any) => {
                      const dt = formatDateTime(c.control_date_time)
                      const isPast = new Date(c.control_date_time) < new Date()
                      return (
                        <li key={c.id} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${isPast ? 'bg-gray-700/50 text-gray-400' : 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/30'}`}>
                          <span>{dt.date} à {dt.time}</span>
                          {c.notes && <span className="text-gray-400 truncate max-w-[200px]">{c.notes}</span>}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Historique des rendez-vous ({appointments.length})</h2>
              {appointments.length === 0 ? (
                <p className="text-gray-400">Aucun rendez-vous</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const dateTime = appointment.confirmed_date_time
                      ? formatDateTime(appointment.confirmed_date_time)
                      : formatDateTime(appointment.requested_date_time)

                    return (
                      <div key={appointment.id} className="bg-gray-800 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-white font-medium">{dateTime.date}</p>
                            <p className="text-gray-400">{dateTime.time}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        {appointment.reason && (
                          <p className="text-gray-300 mb-2">Raison: {appointment.reason}</p>
                        )}
                        {appointment.notes && (
                          <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                            <p className="text-blue-300 text-sm mb-1">Notes:</p>
                            <p className="text-gray-300 text-sm">{appointment.notes}</p>
                          </div>
                        )}
                        {appointment.observations && (
                          <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                            <p className="text-purple-300 text-sm mb-1">Observations:</p>
                            <p className="text-gray-300 text-sm">{appointment.observations}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Ordonnances ({prescriptions.length})</h2>
              {prescriptions.length === 0 ? (
                <p className="text-gray-400">Aucune ordonnance</p>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="bg-gray-800 rounded-xl p-6">
                      <p className="text-white font-medium mb-2">{prescription.file_name}</p>
                      {prescription.description && (
                        <p className="text-gray-400 text-sm mb-2">{prescription.description}</p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {new Date(prescription.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <a
                        href={prescription.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-sm"
                      >
                        Voir le PDF
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
