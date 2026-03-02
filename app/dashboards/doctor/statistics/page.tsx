'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function DoctorStatisticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month')

  useEffect(() => {
    fetchStatistics()
  }, [period])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/statistics?period=${period}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
      const data = await response.json()
      setStats(data.statistics)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const periodText = {
    day: "Aujourd'hui",
    week: 'Cette semaine',
    month: 'Ce mois'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/doctor" className="text-xl font-bold text-gray-900">
                DentAssist
              </Link>
              <span className="text-gray-500">/ Statistiques</span>
            </div>
            <Link
              href="/dashboards/doctor"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg transition ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {periodText[p]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Total RDV</h3>
              <p className="text-4xl font-bold">{stats.totalAppointments || 0}</p>
              <p className="text-blue-100 text-sm mt-2">{periodText[period]}</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Confirmés</h3>
              <p className="text-4xl font-bold">{stats.confirmedAppointments || 0}</p>
              <p className="text-green-100 text-sm mt-2">Rendez-vous confirmés</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Terminés</h3>
              <p className="text-4xl font-bold">{stats.completedAppointments || 0}</p>
              <p className="text-purple-100 text-sm mt-2">Rendez-vous terminés</p>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Annulés</h3>
              <p className="text-4xl font-bold">{stats.cancelledAppointments || 0}</p>
              <p className="text-red-100 text-sm mt-2">Rendez-vous annulés</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Patients</h3>
              <p className="text-4xl font-bold">{stats.totalPatients || 0}</p>
              <p className="text-yellow-100 text-sm mt-2">Patients uniques</p>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Ordonnances</h3>
              <p className="text-4xl font-bold">{stats.prescriptionsCount || 0}</p>
              <p className="text-teal-100 text-sm mt-2">Ordonnances assignées</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Revenus RDV</h3>
              <p className="text-4xl font-bold">{stats.totalIncome ?? 0} DT</p>
              <p className="text-emerald-100 text-sm mt-2">{stats.paidAppointmentsCount ?? 0} RDV payés × {stats.rdvUnitPrice ?? 70} DT</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
