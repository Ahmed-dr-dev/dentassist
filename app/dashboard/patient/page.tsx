'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PatientHeader from '@/app/components/PatientHeader'

export default function PatientDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PatientHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tableau de bord Patient</h1>
          <p className="text-gray-400">Gérez vos rendez-vous et consultations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold mb-1">1</div>
            <div className="text-blue-100">Prochain RDV</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-green-100">Visites totales</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-3xl font-bold mb-1">5</div>
            <div className="text-purple-100">Ordonnances</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">🔔</div>
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-orange-100">Notifications</div>
          </div>
        </div>

        {/* Upcoming Appointment Alert */}
        <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-2xl animate-pulse">
                📅
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Prochain rendez-vous demain!</h3>
                <p className="text-gray-300">Détartrage avec Dr. Alami à 14:30</p>
              </div>
            </div>
            <Link href="/dashboard/patient/appointments" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition">
              Voir les détails
            </Link>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Informations du profil</h2>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <span className="text-gray-400">Nom complet:</span>
                  <p className="text-white font-medium">{user?.fullName}</p>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                <div>
                  <span className="text-gray-400">Téléphone:</span>
                  <p className="text-white font-medium">{user?.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Type de compte:</span>
                  <p className="text-white font-medium">Patient</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard/patient/profile" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">
              Modifier
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/patient/appointments" className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-blue-600/50 transition cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Prendre rendez-vous</h3>
            <p className="text-blue-100">Réservez une consultation</p>
          </Link>

          <Link href="/dashboard/patient/records" className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-purple-600/50 transition cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Mes documents</h3>
            <p className="text-purple-100">Ordonnances & factures</p>
          </Link>

          <Link href="/dashboard/patient/profile" className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-green-600/50 transition cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Mon profil</h3>
            <p className="text-green-100">Modifier mes informations</p>
          </Link>
        </div>
      </main>
    </div>
  )
}


