'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'

export default function DoctorAppointmentsListPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
  const [stats, setStats] = useState({ confirmedCount: 0, remainingQuota: 30 })
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'patient'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [period])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/doctor/list?period=${period}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
      const data = await response.json()
      setAppointments(data.appointments || [])
      setStats({
        confirmedCount: data.confirmedCount || 0,
        remainingQuota: data.remainingQuota || 0
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt => {
        const patient = apt.patient as any
        const name = (patient?.full_name || '').toLowerCase()
        const email = (patient?.email || '').toLowerCase()
        const phone = (patient?.phone || '').toLowerCase()
        const reason = (apt.reason || '').toLowerCase()
        
        return name.includes(query) || 
               email.includes(query) || 
               phone.includes(query) ||
               reason.includes(query)
      })
    }

    // Sort appointments
    filtered.sort((a, b) => {
      let compareA: any, compareB: any

      if (sortBy === 'date') {
        compareA = a.confirmed_date_time || a.requested_date_time
        compareB = b.confirmed_date_time || b.requested_date_time
      } else if (sortBy === 'status') {
        compareA = a.status
        compareB = b.status
      } else if (sortBy === 'patient') {
        const patientA = a.patient as any
        const patientB = b.patient as any
        compareA = (patientA?.full_name || '').toLowerCase()
        compareB = (patientB?.full_name || '').toLowerCase()
      }

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [appointments, searchQuery, statusFilter, sortBy, sortOrder])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✓'
      case 'pending':
        return '⏳'
      case 'rejected':
        return '✗'
      case 'completed':
        return '✓✓'
      case 'cancelled':
        return '⊘'
      default:
        return '•'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé'
      case 'pending':
        return 'En attente'
      case 'rejected':
        return 'Rejeté'
      case 'completed':
        return 'Terminé'
      case 'cancelled':
        return 'Annulé'
      default:
        return status
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      fullDate: date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  const periodText = {
    day: "Aujourd'hui",
    week: 'Cette semaine',
    month: 'Ce mois'
  }

  const statusCounts = useMemo(() => {
    return {
      all: appointments.length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      pending: appointments.filter(a => a.status === 'pending').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      rejected: appointments.filter(a => a.status === 'rejected').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    }
  }, [appointments])

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-300 border-green-500'
      case 'unpaid':
        return 'bg-red-500/20 text-red-300 border-red-500'
      case 'pending':
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé'
      case 'unpaid':
        return 'Non payé'
      case 'pending':
      default:
        return 'En attente'
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓'
      case 'unpaid':
        return '✗'
      case 'pending':
      default:
        return '⏳'
    }
  }

  const handlePaymentStatusUpdate = async (appointmentId: string, paymentStatus: string) => {
    setUpdatingPaymentId(appointmentId)
    setError('')
    
    try {
      const response = await fetch('/api/appointments/payment-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          paymentStatus
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      // Refresh appointments
      fetchAppointments()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingPaymentId(null)
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
              <span className="text-gray-400">/ Liste des RDV</span>
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
          <h1 className="text-3xl font-bold text-white mb-6">Liste des rendez-vous</h1>
          
          {/* Period Selector */}
          <div className="flex gap-2 mb-6">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-lg transition font-medium ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {periodText[p]}
              </button>
            ))}
          </div>

          {/* Stats Card */}
          {period === 'day' && (
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm mb-1">Quota quotidien</p>
                  <p className="text-white text-2xl font-bold">
                    {stats.confirmedCount} / 30 confirmés
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-300 text-3xl font-bold">{stats.remainingQuota}</p>
                  <p className="text-green-200 text-sm">places restantes</p>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${(stats.confirmedCount / 30) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone ou raison..."
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

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm font-medium">Statut:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Tous ({statusCounts.all})</option>
                <option value="confirmed">Confirmés ({statusCounts.confirmed})</option>
                <option value="pending">En attente ({statusCounts.pending})</option>
                <option value="completed">Terminés ({statusCounts.completed})</option>
                <option value="rejected">Rejetés ({statusCounts.rejected})</option>
                <option value="cancelled">Annulés ({statusCounts.cancelled})</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm font-medium">Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'patient')}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="date">Date</option>
                <option value="status">Statut</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition"
              title={sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {/* Results Count */}
            <div className="ml-auto text-gray-400 text-sm">
              {filteredAppointments.length} rendez-vous trouvé(s)
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <svg className="mx-auto w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg">
              {searchQuery || statusFilter !== 'all' 
                ? 'Aucun rendez-vous ne correspond aux critères de recherche'
                : `Aucun rendez-vous pour ${periodText[period].toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.map((appointment) => {
              const patient = appointment.patient as any
              const confirmedDateTime = appointment.confirmed_date_time
                ? formatDateTime(appointment.confirmed_date_time)
                : null
              const requestedDateTime = appointment.requested_date_time
                ? formatDateTime(appointment.requested_date_time)
                : null

              return (
                <div
                  key={appointment.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {patient?.full_name || 'Patient'}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-sm truncate">{patient?.email}</p>
                        {patient?.phone && (
                          <p className="text-gray-400 text-sm">📞 {patient.phone}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 whitespace-nowrap ${getStatusColor(appointment.status)}`}>
                      <span>{getStatusIcon(appointment.status)}</span>
                      <span>{getStatusText(appointment.status)}</span>
                    </span>
                  </div>

                  {/* DateTime */}
                  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                    {confirmedDateTime ? (
                      <>
                        <p className="text-gray-400 text-xs mb-1">Date et heure confirmées:</p>
                        <p className="text-white font-medium text-sm">{confirmedDateTime.date}</p>
                        <p className="text-blue-400 font-semibold">{confirmedDateTime.time}</p>
                      </>
                    ) : requestedDateTime ? (
                      <>
                        <p className="text-gray-400 text-xs mb-1">Date et heure demandées:</p>
                        <p className="text-white font-medium text-sm">{requestedDateTime.date}</p>
                        <p className="text-yellow-400 font-semibold">{requestedDateTime.time}</p>
                      </>
                    ) : null}
                  </div>

                  {/* Reason */}
                  {appointment.reason && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-xs font-semibold mb-1">Raison:</p>
                      <p className="text-gray-300 text-sm line-clamp-2">{appointment.reason}</p>
                    </div>
                  )}

                  {/* Medical History */}
                  {appointment.medical_history && (
                    <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-xs font-semibold mb-1">⚠️ Antécédents:</p>
                      <p className="text-gray-300 text-xs line-clamp-1">{appointment.medical_history}</p>
                    </div>
                  )}

                  {/* Medications */}
                  {appointment.current_medications && (
                    <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <p className="text-orange-300 text-xs font-semibold mb-1">💊 Médicaments:</p>
                      <p className="text-gray-300 text-xs line-clamp-1">{appointment.current_medications}</p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {appointment.rejection_reason && (
                    <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-xs font-semibold mb-1">Rejet:</p>
                      <p className="text-gray-300 text-xs line-clamp-2">{appointment.rejection_reason}</p>
                    </div>
                  )}

                  {/* Payment Approval - Show file if uploaded */}
                  {appointment.payment_approval_path && (
                    <div className="mt-4 mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-green-300 text-xs font-semibold flex items-center gap-2">
                          <span>💳</span>
                          <span>Preuve de paiement téléchargée</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-gray-300 text-xs truncate">{appointment.payment_approval_file_name || 'Fichier'}</p>
                        <a
                          href={appointment.payment_approval_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-xs font-medium whitespace-nowrap"
                        >
                          📄 Voir le fichier
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Payment Status */}
                  {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                    <div className="mt-4 mb-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-xs font-medium">Statut du paiement:</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getPaymentStatusColor(appointment.payment_status || 'pending')}`}>
                          <span>{getPaymentStatusIcon(appointment.payment_status || 'pending')}</span>
                          <span>{getPaymentStatusText(appointment.payment_status || 'pending')}</span>
                        </span>
                      </div>
                      
                      {appointment.payment_approval_path && (
                        <p className="mb-2 text-xs text-gray-400">💡 Consultez la preuve de paiement ci-dessus avant de marquer comme payé</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePaymentStatusUpdate(appointment.id, 'paid')}
                          disabled={updatingPaymentId === appointment.id || appointment.payment_status === 'paid'}
                          className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingPaymentId === appointment.id ? '...' : 'Marquer payé'}
                        </button>
                        <button
                          onClick={() => handlePaymentStatusUpdate(appointment.id, 'unpaid')}
                          disabled={updatingPaymentId === appointment.id || appointment.payment_status === 'unpaid'}
                          className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingPaymentId === appointment.id ? '...' : 'Non payé'}
                        </button>
                        {appointment.payment_status !== 'pending' && (
                          <button
                            onClick={() => handlePaymentStatusUpdate(appointment.id, 'pending')}
                            disabled={updatingPaymentId === appointment.id}
                            className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingPaymentId === appointment.id ? '...' : 'En attente'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Created At */}
                  <div className="mt-2 pt-3 border-t border-gray-700">
                    <p className="text-gray-500 text-xs">
                      Créé le {new Date(appointment.created_at).toLocaleDateString('fr-FR')}
                    </p>
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
