'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DentistHeader from '@/app/components/DentistHeader'

export default function DentistDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [patientCount, setPatientCount] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      if (data.user.role !== 'dentist') {
        router.push('/dashboard/patient')
        return
      }
      setUser(data.user)
      
      // Fetch patient count
      const patientsResponse = await fetch('/api/patients')
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json()
        setPatientCount(patientsData.patients?.length || 0)
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  const todayAppointments = [
    {
      id: 1,
      patient: 'Ahmed Benali',
      service: 'Détartrage',
      time: '09:00',
      duration: '45 min',
      status: 'confirmed'
    },
    {
      id: 2,
      patient: 'Sara El Amrani',
      service: 'Consultation',
      time: '10:00',
      duration: '30 min',
      status: 'confirmed'
    },
    {
      id: 3,
      patient: 'Mohammed Tazi',
      service: 'Extraction',
      time: '14:30',
      duration: '60 min',
      status: 'pending'
    }
  ]

  const upcomingWeek = [
    { date: '2025-01-15', count: 8 },
    { date: '2025-01-16', count: 6 },
    { date: '2025-01-17', count: 9 },
    { date: '2025-01-18', count: 5 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <DentistHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bienvenue, Dr. {user?.fullName?.split(' ').pop()}</h1>
          <p className="text-gray-400">Voici votre aperçu d'aujourd'hui</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">📅</div>
              <span className="text-blue-100 text-sm">Aujourd'hui</span>
            </div>
            <div className="text-3xl font-bold mb-1">8</div>
            <div className="text-blue-100">Rendez-vous</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">👥</div>
              <span className="text-green-100 text-sm">Total</span>
            </div>
            <div className="text-3xl font-bold mb-1">{patientCount}</div>
            <div className="text-green-100">Patients</div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">⏰</div>
              <span className="text-purple-100 text-sm">En attente</span>
            </div>
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-purple-100">À confirmer</div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">💰</div>
              <span className="text-orange-100 text-sm">Ce mois</span>
            </div>
            <div className="text-3xl font-bold mb-1">15.6K</div>
            <div className="text-orange-100">DH Revenus</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Rendez-vous du jour</h2>
              <Link href="/dashboard/dentist/appointments" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Voir tout →
              </Link>
            </div>

            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {apt.patient.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{apt.patient}</h3>
                        <p className="text-gray-400 text-sm">{apt.service} • {apt.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white mb-2">{apt.time}</div>
                      {apt.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-400 text-sm font-medium">Confirmé</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600/20 border border-orange-500 rounded-full">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-orange-400 text-sm font-medium">En attente</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Calendar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau rendez-vous
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ajouter un patient
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Créer ordonnance
                </button>
              </div>
            </div>

            {/* Upcoming Week */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Prochains jours</h3>
              <div className="space-y-3">
                {upcomingWeek.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <span className="text-gray-300">{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span className="px-3 py-1 bg-blue-600/20 border border-blue-500 rounded-full text-blue-400 text-sm font-medium">
                      {day.count} RDV
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
