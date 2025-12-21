'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
      {/* Header */}
      <header className="border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/80">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <Image 
                src="/logo1.png" 
                alt="DentAssist Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">DentAssist</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Bonjour, {user?.fullName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
            >
              Déconnexion
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tableau de bord Patient</h1>
          <p className="text-gray-400">Gérez vos rendez-vous et consultations</p>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-blue-600/50 transition cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Prendre rendez-vous</h3>
            <p className="text-blue-100">Réservez une consultation</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-purple-600/50 transition cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Mes rendez-vous</h3>
            <p className="text-purple-100">Consultez vos RDV</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-green-600/50 transition cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Mon profil</h3>
            <p className="text-green-100">Modifier mes informations</p>
          </div>
        </div>
      </main>
    </div>
  )
}

