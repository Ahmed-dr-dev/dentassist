'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionType, setRejectionType] = useState<'alternatives' | 'nearest'>('alternatives')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [loadingDates, setLoadingDates] = useState(false)
  const [dentistInfo, setDentistInfo] = useState({
    name: '',
    address: '',
    phone: ''
  })

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'patient'>('date')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/appointments/doctor/list?period=month')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
      const data = await response.json()
      const pending = (data.appointments || []).filter((apt: any) => apt.status === 'pending')
      setAppointments(pending)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt => {
        const patient = apt.patient as any
        const name = (patient?.full_name || '').toLowerCase()
        const email = (patient?.email || '').toLowerCase()
        const phone = (patient?.phone || '').toLowerCase()
        const reason = (apt.reason || '').toLowerCase()
        const medicalHistory = (apt.medical_history || '').toLowerCase()
        const medications = (apt.current_medications || '').toLowerCase()
        
        return name.includes(query) || 
               email.includes(query) || 
               phone.includes(query) ||
               reason.includes(query) ||
               medicalHistory.includes(query) ||
               medications.includes(query)
      })
    }

    // Sort appointments
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.requested_date_time).getTime()
        const dateB = new Date(b.requested_date_time).getTime()
        return dateA - dateB
      } else if (sortBy === 'patient') {
        const patientA = a.patient as any
        const patientB = b.patient as any
        const nameA = (patientA?.full_name || '').toLowerCase()
        const nameB = (patientB?.full_name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      }
      return 0
    })

    return filtered
  }, [appointments, searchQuery, sortBy])

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'reject') => {
    if (action === 'accept') {
      setProcessingId(appointmentId)
      setError('')
      setSuccess('')

      try {
        const response = await fetch('/api/appointments/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId,
            action
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la mise à jour')
        }

        setSuccess(data.message || 'Rendez-vous accepté avec succès')
        
        setTimeout(() => {
          fetchAppointments()
          setSuccess('')
        }, 2000)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setProcessingId(null)
      }
    }
  }

  const handleRejectWithAlternatives = async () => {
    if (!rejectingId) return

    if (rejectionType === 'alternatives' && selectedDates.length === 0) {
      setError('Veuillez sélectionner au moins une date alternative')
      return
    }

    if (rejectionType === 'nearest' && (!dentistInfo.name || !dentistInfo.address || !dentistInfo.phone)) {
      setError('Veuillez remplir toutes les informations du dentiste recommandé')
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/appointments/reject-with-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: rejectingId,
          rejectionReason: rejectionReason || null,
          alternativeDates: rejectionType === 'alternatives' ? selectedDates : null,
          suggestNearestDoctor: rejectionType === 'nearest',
          dentistName: rejectionType === 'nearest' ? dentistInfo.name : null,
          dentistAddress: rejectionType === 'nearest' ? dentistInfo.address : null,
          dentistPhone: rejectionType === 'nearest' ? dentistInfo.phone : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du rejet')
      }

      setSuccess('Rendez-vous rejeté avec alternatives fournies')
      setShowRejectModal(null)
      setRejectingId(null)
      setRejectionReason('')
      setRejectionType('alternatives')
      setSelectedDates([])
      setDentistInfo({ name: '', address: '', phone: '' })
      
      setTimeout(() => {
        fetchAppointments()
        setSuccess('')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      shortDate: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
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
              <span className="text-gray-400">/ Gérer les RDV</span>
            </div>
            <Link
              href="/dashboards/doctor"
              className="flex items-center text-gray-300 hover:text-white transition"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Gérer les rendez-vous</h1>
        </div>

        {/* Search and Filters */}
        {appointments.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone, raison, antécédents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <label className="text-gray-300 text-sm font-medium">Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'patient')}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="date">Date demandée</option>
                <option value="patient">Nom du patient</option>
              </select>
              <div className="ml-auto text-gray-400 text-sm">
                {filteredAppointments.length} résultat(s)
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300 flex items-center gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <svg className="mx-auto w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg">
              {searchQuery 
                ? 'Aucune demande ne correspond à votre recherche'
                : 'Aucune demande en attente'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredAppointments.map((appointment) => {
              const patient = appointment.patient as any
              const dateTime = formatDateTime(appointment.requested_date_time)

              return (
                <div
                  key={appointment.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-700">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-1 truncate">
                        {patient?.full_name || 'Patient'}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-sm truncate">📧 {patient?.email}</p>
                        {patient?.phone && (
                          <p className="text-gray-400 text-sm">📞 {patient.phone}</p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500 whitespace-nowrap">
                      ⏳ En attente
                    </span>
                  </div>

                  {/* DateTime Card */}
                  <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-xs font-semibold mb-2">Date et heure demandées</p>
                    <p className="text-white font-semibold text-sm mb-1">{dateTime.date}</p>
                    <p className="text-blue-400 font-bold text-lg">{dateTime.time}</p>
                  </div>

                  {/* Reason */}
                  {appointment.reason && (
                    <div className="mb-4 p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                      <p className="text-gray-400 text-xs font-semibold mb-1">💬 Raison de la visite</p>
                      <p className="text-gray-300 text-sm">{appointment.reason}</p>
                    </div>
                  )}

                  {/* Medical History */}
                  {appointment.medical_history && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-xs font-semibold mb-1">⚠️ Antécédents médicaux</p>
                      <p className="text-gray-300 text-sm">{appointment.medical_history}</p>
                    </div>
                  )}

                  {/* Medications */}
                  {appointment.current_medications && (
                    <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <p className="text-orange-300 text-xs font-semibold mb-1">💊 Médicaments actuels</p>
                      <p className="text-gray-300 text-sm">{appointment.current_medications}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                      disabled={processingId === appointment.id}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingId === appointment.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Accepter</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={async () => {
                        setRejectingId(appointment.id)
                        setShowRejectModal(appointment.id)
                        setRejectionReason('')
                        setRejectionType('alternatives')
                        setSelectedDates([])
                        setDentistInfo({ name: '', address: '', phone: '' })
                        
                        setLoadingDates(true)
                        try {
                          const response = await fetch('/api/appointments/available-dates?days=7')
                          if (response.ok) {
                            const data = await response.json()
                            setAvailableDates(data.availableDates || [])
                          }
                        } catch (error) {
                          console.error('Error loading dates:', error)
                        } finally {
                          setLoadingDates(false)
                        }
                      }}
                      disabled={processingId === appointment.id || rejectingId === appointment.id}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>✗</span>
                      <span>Rejeter</span>
                    </button>
                  </div>

                  {/* Reject Modal */}
                  {showRejectModal === appointment.id && (
                    <div className="mt-6 p-6 bg-gray-750 border-2 border-red-500/50 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-bold text-lg">Options de rejet</h4>
                        <button
                          onClick={() => {
                            setShowRejectModal(null)
                            setRejectingId(null)
                            setRejectionReason('')
                            setSelectedDates([])
                            setDentistInfo({ name: '', address: '', phone: '' })
                          }}
                          className="text-gray-400 hover:text-white transition"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Type de rejet *
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center cursor-pointer p-3 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition">
                            <input
                              type="radio"
                              name={`rejectionType-${appointment.id}`}
                              value="alternatives"
                              checked={rejectionType === 'alternatives'}
                              onChange={(e) => setRejectionType('alternatives')}
                              className="mr-3 w-4 h-4"
                            />
                            <span className="text-gray-300">📅 Proposer des dates alternatives disponibles</span>
                          </label>
                          <label className="flex items-center cursor-pointer p-3 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition">
                            <input
                              type="radio"
                              name={`rejectionType-${appointment.id}`}
                              value="nearest"
                              checked={rejectionType === 'nearest'}
                              onChange={(e) => setRejectionType('nearest')}
                              className="mr-3 w-4 h-4"
                            />
                            <span className="text-gray-300">📍 Cabinet plein - Diriger vers dentistes à Gafsa</span>
                          </label>
                        </div>
                      </div>

                      {rejectionType === 'alternatives' && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Sélectionner des dates alternatives disponibles *
                          </label>
                          {loadingDates ? (
                            <div className="p-4 text-center text-gray-400">
                              <svg className="animate-spin h-5 w-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Chargement des dates disponibles...
                            </div>
                          ) : availableDates.length === 0 ? (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <p className="text-yellow-300 text-sm">⚠️ Aucune date disponible dans les 7 prochains jours</p>
                            </div>
                          ) : (
                            <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-600 rounded-lg p-3 bg-gray-700/50">
                              {availableDates.map((dateStr: string, idx: number) => {
                                const date = new Date(dateStr)
                                const dateFormatted = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                                const timeFormatted = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                const isSelected = selectedDates.includes(dateStr)
                                
                                return (
                                  <label
                                    key={idx}
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
                                      isSelected 
                                        ? 'bg-blue-600/30 border-2 border-blue-500' 
                                        : 'border border-gray-600 hover:bg-gray-600/50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedDates([...selectedDates, dateStr])
                                        } else {
                                          setSelectedDates(selectedDates.filter(d => d !== dateStr))
                                        }
                                      }}
                                      className="mr-3 w-4 h-4"
                                    />
                                    <span className="text-gray-300 text-sm">
                                      {dateFormatted} à {timeFormatted}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                          {selectedDates.length > 0 && (
                            <p className="mt-3 text-green-400 text-sm font-medium flex items-center gap-2">
                              <span>✓</span>
                              <span>{selectedDates.length} date(s) sélectionnée(s)</span>
                            </p>
                          )}
                        </div>
                      )}

                      {rejectionType === 'nearest' && (
                        <div className="mb-4 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Nom du dentiste *
                            </label>
                            <input
                              type="text"
                              value={dentistInfo.name}
                              onChange={(e) => setDentistInfo({ ...dentistInfo, name: e.target.value })}
                              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                              placeholder="Ex: Dr. Ahmed Ben Ali"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Adresse *
                            </label>
                            <input
                              type="text"
                              value={dentistInfo.address}
                              onChange={(e) => setDentistInfo({ ...dentistInfo, address: e.target.value })}
                              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                              placeholder="Ex: Avenue Habib Bourguiba, Gafsa"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Téléphone *
                            </label>
                            <input
                              type="tel"
                              value={dentistInfo.phone}
                              onChange={(e) => setDentistInfo({ ...dentistInfo, phone: e.target.value })}
                              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                              placeholder="Ex: +216 76 220 123"
                            />
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Raison du rejet (optionnel)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                          placeholder="Ex: Date non disponible, Cabinet plein..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleRejectWithAlternatives}
                          className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-medium"
                        >
                          Confirmer le rejet
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectModal(null)
                            setRejectingId(null)
                            setRejectionReason('')
                            setSelectedDates([])
                            setDentistInfo({ name: '', address: '', phone: '' })
                          }}
                          className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
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
