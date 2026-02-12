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
              <span className="text-gray-600">/ Mes Patients</span>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Patients</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {patients.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
            <p className="text-gray-600">Aucun patient trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboards/doctor/patients/${patient.id}`}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition cursor-pointer"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{patient.full_name}</h3>
                <p className="text-gray-600 text-sm mb-4">{patient.email}</p>
                {patient.phone && (
                  <p className="text-gray-600 text-sm mb-4">📞 {patient.phone}</p>
                )}
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="text-gray-900 ml-2">{patient.totalAppointments || 0}</span>
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
