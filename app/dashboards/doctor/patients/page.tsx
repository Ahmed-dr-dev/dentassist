'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DoctorPatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients/list')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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
              <span className="text-gray-400">/ Mes Patients</span>
            </div>
            <Link
              href="/dashboards/doctor"
              className="flex items-center text-gray-300 hover:text-white"
            >
              Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Mes Patients</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {patients.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">Aucun patient trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboards/doctor/patients/${patient.id}`}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition cursor-pointer"
              >
                <h3 className="text-xl font-bold text-white mb-2">{patient.full_name}</h3>
                <p className="text-gray-400 text-sm mb-4">{patient.email}</p>
                {patient.phone && (
                  <p className="text-gray-400 text-sm mb-4">📞 {patient.phone}</p>
                )}
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="text-white ml-2">{patient.totalAppointments || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Terminés:</span>
                    <span className="text-green-400 ml-2">{patient.completedAppointments || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">À venir:</span>
                    <span className="text-blue-400 ml-2">{patient.upcomingAppointments || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
