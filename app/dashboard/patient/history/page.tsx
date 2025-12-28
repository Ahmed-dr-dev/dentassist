'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PatientHeader from '@/app/components/PatientHeader'

export default function MedicalHistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedVisit, setSelectedVisit] = useState<any>(null)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  const medicalHistory = [
    {
      id: 1,
      date: '2024-12-10',
      dentist: 'Dr. Benali',
      type: 'Consultation + Détartrage',
      diagnosis: 'Bonne hygiène dentaire générale',
      treatment: 'Détartrage complet et polissage',
      notes: 'Recommandation: continuer le brossage 2x par jour',
      nextVisit: '2025-06-10',
      cost: 450,
      teeth: ['11', '12', '21', '22']
    },
    {
      id: 2,
      date: '2024-11-15',
      dentist: 'Dr. Alami',
      type: 'Consultation générale',
      diagnosis: 'Légère sensibilité dentaire',
      treatment: 'Application de fluorure',
      notes: 'Utiliser dentifrice pour dents sensibles',
      nextVisit: null,
      cost: 200,
      teeth: ['31', '32']
    },
    {
      id: 3,
      date: '2024-09-20',
      dentist: 'Dr. Benali',
      type: 'Traitement de carie',
      diagnosis: 'Carie sur molaire droite',
      treatment: 'Obturation composite',
      notes: 'Éviter aliments très sucrés',
      nextVisit: null,
      cost: 350,
      teeth: ['46']
    },
    {
      id: 4,
      date: '2024-07-05',
      dentist: 'Dr. Alami',
      type: 'Radiographie panoramique',
      diagnosis: 'Structure dentaire saine',
      treatment: 'Radiographie + consultation',
      notes: 'Aucune anomalie détectée',
      nextVisit: null,
      cost: 180,
      teeth: []
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PatientHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Historique Médical</h1>
          <p className="text-gray-400">Consultez l'historique complet de vos traitements dentaires</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">🦷</div>
            <div className="text-3xl font-bold mb-1">{medicalHistory.length}</div>
            <div className="text-blue-100">Visites totales</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-green-100">Traitements</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold mb-1">Jun 10</div>
            <div className="text-purple-100">Prochain contrôle</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-3xl font-bold mb-1">1,180</div>
            <div className="text-orange-100">Total DH (2024)</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {medicalHistory.map((visit, index) => (
            <div key={visit.id} className="relative">
              {/* Timeline line */}
              {index !== medicalHistory.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 -mb-6"></div>
              )}
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500 transition relative">
                {/* Timeline dot */}
                <div className="absolute -left-2 top-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {visit.id}
                </div>
                
                <div className="ml-20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{visit.type}</h3>
                        <span className="px-3 py-1 bg-blue-600/20 border border-blue-500 rounded-full text-blue-400 text-sm">
                          {new Date(visit.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-gray-400">Avec {visit.dentist}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-1">{visit.cost} DH</div>
                      <button
                        onClick={() => setSelectedVisit(visit)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Voir détails →
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Diagnostic</div>
                      <div className="text-white font-medium">{visit.diagnosis}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Traitement</div>
                      <div className="text-white font-medium">{visit.treatment}</div>
                    </div>
                  </div>

                  {visit.teeth.length > 0 && (
                    <div className="mb-4">
                      <div className="text-gray-400 text-sm mb-2">Dents traitées:</div>
                      <div className="flex gap-2 flex-wrap">
                        {visit.teeth.map((tooth) => (
                          <span key={tooth} className="px-3 py-1 bg-purple-600/20 border border-purple-500 rounded-lg text-purple-400 text-sm font-mono">
                            {tooth}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {visit.notes}
                  </div>

                  {visit.nextVisit && (
                    <div className="mt-4 p-3 bg-green-600/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-green-400 text-sm">Prochain contrôle recommandé: {new Date(visit.nextVisit).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedVisit && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedVisit(null)}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Détails de la visite</h2>
                <button onClick={() => setSelectedVisit(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">Date</div>
                  <div className="text-white font-medium text-lg">{new Date(selectedVisit.date).toLocaleDateString('fr-FR', { dateStyle: 'full' })}</div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">Praticien</div>
                  <div className="text-white font-medium text-lg">{selectedVisit.dentist}</div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">Type de visite</div>
                  <div className="text-white font-medium text-lg">{selectedVisit.type}</div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">Coût total</div>
                  <div className="text-white font-medium text-lg">{selectedVisit.cost} DH</div>
                </div>

                <button
                  onClick={() => setSelectedVisit(null)}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

