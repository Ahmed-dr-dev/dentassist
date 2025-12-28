'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PatientHeader from '@/app/components/PatientHeader'

export default function RecordsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'invoices'>('prescriptions')

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

  const prescriptions = [
    {
      id: 1,
      date: '2024-12-10',
      doctor: 'Dr. Benali',
      medications: ['Amoxicilline 500mg', 'Ibuprofène 400mg'],
      notes: 'Prendre 3 fois par jour pendant 7 jours'
    },
    {
      id: 2,
      date: '2024-11-15',
      doctor: 'Dr. Alami',
      medications: ['Paracétamol 1000mg'],
      notes: 'En cas de douleur'
    }
  ]

  const invoices = [
    {
      id: 1,
      date: '2024-12-10',
      service: 'Consultation + Détartrage',
      amount: 450,
      status: 'paid'
    },
    {
      id: 2,
      date: '2024-11-15',
      service: 'Consultation générale',
      amount: 200,
      status: 'paid'
    },
    {
      id: 3,
      date: '2024-10-05',
      service: 'Blanchiment dentaire',
      amount: 800,
      status: 'pending'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PatientHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mes Documents</h1>
          <p className="text-gray-400">Accédez à vos ordonnances et factures</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'prescriptions'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 Ordonnances
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'invoices'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💳 Factures
          </button>
        </div>

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center text-2xl">
                      📋
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Ordonnance #{prescription.id}</h3>
                      <p className="text-gray-400 mb-2">Prescrit par {prescription.doctor}</p>
                      <p className="text-gray-500 text-sm">{new Date(prescription.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger
                  </button>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Médicaments prescrits:</h4>
                    <ul className="space-y-1">
                      {prescription.medications.map((med, idx) => (
                        <li key={idx} className="text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          {med}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Notes:</h4>
                    <p className="text-gray-300">{prescription.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                      💳
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{invoice.service}</h3>
                      <p className="text-gray-400 text-sm">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <div className="text-2xl font-bold text-white mb-2">{invoice.amount} DH</div>
                      {invoice.status === 'paid' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-400 text-sm font-medium">Payée</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600/20 border border-orange-500 rounded-full">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-orange-400 text-sm font-medium">En attente</span>
                        </span>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Total Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg mb-1 text-blue-100">Total des dépenses (2024)</h3>
                  <p className="text-3xl font-bold">1,450 DH</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                  💰
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

