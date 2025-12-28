'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DentistHeader from '@/app/components/DentistHeader'

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

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

  const analytics = {
    appointments: {
      total: 156,
      completed: 142,
      cancelled: 8,
      noShow: 6,
      avgPerDay: 5.2
    },
    revenue: {
      total: 78500,
      avgPerAppointment: 503,
      growth: 12.5
    },
    services: [
      { name: 'Détartrage', count: 45, revenue: 20250, percentage: 28.8 },
      { name: 'Consultation', count: 62, revenue: 12400, percentage: 39.7 },
      { name: 'Extraction', count: 18, revenue: 14400, percentage: 11.5 },
      { name: 'Blanchiment', count: 12, revenue: 19200, percentage: 7.7 },
      { name: 'Autres', count: 19, revenue: 12250, percentage: 12.2 }
    ],
    patients: {
      total: 124,
      new: 18,
      returning: 106,
      avgVisits: 3.2
    },
    timeDistribution: [
      { time: '08:00-10:00', appointments: 25 },
      { time: '10:00-12:00', appointments: 32 },
      { time: '14:00-16:00', appointments: 45 },
      { time: '16:00-18:00', apartments: 38 }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <DentistHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Statistiques & Analyses</h1>
            <p className="text-gray-400">Visualisez les performances de votre cabinet</p>
          </div>
          
          <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-md transition ${period === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Semaine
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-md transition ${period === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Mois
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-2 rounded-md transition ${period === 'year' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Année
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📊</div>
              <div className="text-blue-100 text-sm">↑ 12.5%</div>
            </div>
            <div className="text-3xl font-bold mb-1">{analytics.appointments.total}</div>
            <div className="text-blue-100">Rendez-vous totaux</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">💰</div>
              <div className="text-green-100 text-sm">↑ {analytics.revenue.growth}%</div>
            </div>
            <div className="text-3xl font-bold mb-1">{(analytics.revenue.total / 1000).toFixed(1)}K</div>
            <div className="text-green-100">Revenus (DH)</div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">👥</div>
              <div className="text-purple-100 text-sm">+{analytics.patients.new} new</div>
            </div>
            <div className="text-3xl font-bold mb-1">{analytics.patients.total}</div>
            <div className="text-purple-100">Patients actifs</div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">⭐</div>
              <div className="text-orange-100 text-sm">Excellent</div>
            </div>
            <div className="text-3xl font-bold mb-1">{((analytics.appointments.completed / analytics.appointments.total) * 100).toFixed(0)}%</div>
            <div className="text-orange-100">Taux d'achèvement</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Services Distribution */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Services populaires</h2>
            <div className="space-y-4">
              {analytics.services.map((service, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{service.name}</span>
                    <div className="text-right">
                      <span className="text-white font-bold">{service.count}</span>
                      <span className="text-gray-400 text-sm ml-2">({service.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all"
                      style={{ width: `${service.percentage * 2.5}%` }}
                    ></div>
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{service.revenue.toLocaleString()} DH</div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Status */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Statut des rendez-vous</h2>
            
            <div className="space-y-4">
              <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-medium">✓ Complétés</span>
                  <span className="text-white font-bold">{analytics.appointments.completed}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${(analytics.appointments.completed / analytics.appointments.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-orange-600/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 font-medium">⚠ Annulés</span>
                  <span className="text-white font-bold">{analytics.appointments.cancelled}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${(analytics.appointments.cancelled / analytics.appointments.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 font-medium">✗ Non présentés</span>
                  <span className="text-white font-bold">{analytics.appointments.noShow}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${(analytics.appointments.noShow / analytics.appointments.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Moyenne par jour</span>
                <span className="text-white font-bold text-xl">{analytics.appointments.avgPerDay}</span>
              </div>
            </div>
          </div>
        </div>

       
      </main>
    </div>
  )
}

