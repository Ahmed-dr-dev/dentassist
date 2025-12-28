'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PatientHeader from '@/app/components/PatientHeader'

export default function AppointmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: ''
  })

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
      if (data.user.role !== 'patient') {
        router.push('/dashboard/dentist')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add API call to book appointment
    alert('Rendez-vous réservé avec succès!')
    setShowBooking(false)
    setFormData({ service: '', date: '', time: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  const services = [
    { value: 'consultation', label: 'Consultation générale', duration: '30 min', icon: '📋' },
    { value: 'detartrage', label: 'Détartrage', duration: '45 min', icon: '✨' },
    { value: 'extraction', label: 'Extraction dentaire', duration: '60 min', icon: '🦷' },
    { value: 'blanchiment', label: 'Blanchiment', duration: '90 min', icon: '⭐' }
  ]

  const upcomingAppointments = [
    {
      id: 1,
      service: 'Détartrage',
      date: '2025-01-15',
      time: '14:30',
      dentist: 'Dr. Alami',
      status: 'confirmed'
    }
  ]

  const pastAppointments = [
    {
      id: 2,
      service: 'Consultation',
      date: '2024-12-10',
      time: '10:00',
      dentist: 'Dr. Benali',
      status: 'completed'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PatientHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mes Rendez-vous</h1>
            <p className="text-gray-400">Gérez vos consultations dentaires</p>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-600/50 transition"
          >
            + Nouveau rendez-vous
          </button>
        </div>

        {/* Booking Modal */}
        {showBooking && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Réserver un rendez-vous</h2>
                <button onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Type de service</label>
                  <div className="grid grid-cols-2 gap-4">
                    {services.map((service) => (
                      <label
                        key={service.value}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                          formData.service === service.value
                            ? 'border-blue-500 bg-blue-600/20'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="service"
                          value={service.value}
                          checked={formData.service === service.value}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="hidden"
                        />
                        <span className="text-3xl">{service.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium">{service.label}</div>
                          <div className="text-gray-400 text-sm">{service.duration}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Heure disponible</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                      <label
                        key={time}
                        className={`p-3 text-center border-2 rounded-lg cursor-pointer transition ${
                          formData.time === time
                            ? 'border-blue-500 bg-blue-600/20 text-white'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="time"
                          value={time}
                          checked={formData.time === time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="hidden"
                        />
                        {time}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBooking(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-600/50 transition"
                  >
                    Confirmer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Rendez-vous à venir</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                      ✨
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{apt.service}</h3>
                      <p className="text-gray-400">Avec {apt.dentist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-white mb-1">{new Date(apt.date).toLocaleDateString('fr-FR')}</div>
                    <div className="text-gray-400">{apt.time}</div>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Confirmé</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Historique</h2>
          <div className="space-y-4">
            {pastAppointments.map((apt) => (
              <div key={apt.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center text-2xl">
                      📋
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{apt.service}</h3>
                      <p className="text-gray-400">Avec {apt.dentist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-white mb-1">{new Date(apt.date).toLocaleDateString('fr-FR')}</div>
                    <div className="text-gray-400">{apt.time}</div>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full">
                      <span className="text-gray-400 text-sm">Terminé</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

