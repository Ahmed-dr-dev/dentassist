'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DentistHeader from '@/app/components/DentistHeader'

export default function DentistAppointmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

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

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  const appointments = [
    {
      id: 1,
      patient: 'Ahmed Benali',
      service: 'Détartrage',
      time: '09:00',
      duration: 45,
      status: 'confirmed',
      phone: '0612345678',
      email: 'ahmed@email.com'
    },
    {
      id: 2,
      patient: 'Sara El Amrani',
      service: 'Consultation',
      time: '10:00',
      duration: 30,
      status: 'confirmed',
      phone: '0623456789',
      email: 'sara@email.com'
    },
    {
      id: 3,
      patient: 'Mohammed Tazi',
      service: 'Extraction',
      time: '14:30',
      duration: 60,
      status: 'pending',
      phone: '0634567890',
      email: 'mohammed@email.com'
    }
  ]

  const getAppointmentAtTime = (time: string) => {
    return appointments.find(apt => apt.time === time)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <DentistHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Agenda des rendez-vous</h1>
            <p className="text-gray-400">Gérez votre planning quotidien</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-md transition ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Jour
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md transition ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Semaine
              </button>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Total: {appointments.length} rendez-vous</span>
            </div>
          </div>

          {/* Time Grid */}
          <div className="space-y-3">
            {timeSlots.map((time) => {
              const appointment = getAppointmentAtTime(time)
              
              return (
                <div key={time} className="flex gap-4">
                  <div className="w-20 text-right text-gray-400 font-medium pt-3">{time}</div>
                  
                  {appointment ? (
                    <div className="flex-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 rounded-lg p-4 hover:from-blue-600/30 hover:to-purple-600/30 transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {appointment.patient.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{appointment.patient}</h3>
                            <p className="text-gray-400 text-sm mb-1">{appointment.service} • {appointment.duration} min</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>📞 {appointment.phone}</span>
                              <span>✉️ {appointment.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {appointment.status === 'confirmed' ? (
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
                          <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 bg-gray-800/50 border border-gray-700 border-dashed rounded-lg p-4 hover:bg-gray-800 transition cursor-pointer group">
                      <div className="flex items-center justify-center text-gray-500 group-hover:text-gray-400">
                        <span className="text-sm">+ Ajouter un rendez-vous</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Total</div>
                <div className="text-2xl font-bold text-white">{appointments.length}</div>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 text-2xl">📅</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Confirmés</div>
                <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'confirmed').length}</div>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center text-green-400 text-2xl">✅</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">En attente</div>
                <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'pending').length}</div>
              </div>
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center text-orange-400 text-2xl">⏰</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Disponibles</div>
                <div className="text-2xl font-bold text-white">{timeSlots.length - appointments.length}</div>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 text-2xl">🕐</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

