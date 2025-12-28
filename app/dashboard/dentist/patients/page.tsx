'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DentistHeader from '@/app/components/DentistHeader'

export default function DentistPatientsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

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

  const patients = [
    {
      id: 1,
      name: 'Ahmed Benali',
      email: 'ahmed@email.com',
      phone: '0612345678',
      lastVisit: '2024-12-10',
      visits: 12,
      allergies: 'Aucune',
      bloodType: 'A+'
    },
    {
      id: 2,
      name: 'Sara El Amrani',
      email: 'sara@email.com',
      phone: '0623456789',
      lastVisit: '2024-12-15',
      visits: 8,
      allergies: 'Pénicilline',
      bloodType: 'O+'
    },
    {
      id: 3,
      name: 'Mohammed Tazi',
      email: 'mohammed@email.com',
      phone: '0634567890',
      lastVisit: '2024-11-20',
      visits: 5,
      allergies: 'Latex',
      bloodType: 'B+'
    }
  ]

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <DentistHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mes Patients</h1>
            <p className="text-gray-400">Gérez vos dossiers patients</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-600/50 transition">
            + Nouveau patient
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un patient par nom, email ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500 transition cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {patient.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{patient.name}</h3>
                  <p className="text-gray-400 text-sm">{patient.visits} visites</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {patient.email}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {patient.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPatient(null)}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Dossier Patient</h2>
                <button onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>

              <div className="space-y-6">
                {/* Patient Info */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-700">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">{selectedPatient.name}</h3>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span>{selectedPatient.email}</span>
                      <span>•</span>
                      <span>{selectedPatient.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div>
                  <h4 className="text-xl font-bold text-white mb-4">Informations médicales</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <span className="text-gray-400 text-sm">Groupe sanguin</span>
                      <p className="text-white font-medium text-lg mt-1">{selectedPatient.bloodType}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <span className="text-gray-400 text-sm">Allergies</span>
                      <p className="text-white font-medium text-lg mt-1">{selectedPatient.allergies}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <span className="text-gray-400 text-sm">Nombre de visites</span>
                      <p className="text-white font-medium text-lg mt-1">{selectedPatient.visits}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <span className="text-gray-400 text-sm">Dernière visite</span>
                      <p className="text-white font-medium text-lg mt-1">{new Date(selectedPatient.lastVisit).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition">
                    Prendre rendez-vous
                  </button>
                  <button className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition">
                    Créer ordonnance
                  </button>
                  <button className="px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition">
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

