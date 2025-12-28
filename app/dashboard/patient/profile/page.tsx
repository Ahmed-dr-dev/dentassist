'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PatientHeader from '@/app/components/PatientHeader'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    bloodType: '',
    allergies: ''
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
      setFormData({
        fullName: data.user.fullName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        dateOfBirth: '',
        address: '',
        bloodType: '',
        allergies: ''
      })
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
    // TODO: Add API call to update profile
    alert('Profil mis à jour avec succès!')
    setEditing(false)
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mon Profil</h1>
            <p className="text-gray-400">Gérez vos informations personnelles</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-600/50 transition"
            >
              ✏️ Modifier
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.fullName?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{user?.fullName}</h2>
              <p className="text-gray-400">Patient • Membre depuis 2024</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date de naissance</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Informations médicales</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Groupe sanguin</label>
                    <select
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Allergies</label>
                    <input
                      type="text"
                      placeholder="Ex: Pénicilline, Latex..."
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-600/50 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <span className="text-gray-400 text-sm">Nom complet</span>
                  <p className="text-white font-medium text-lg">{formData.fullName || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Email</span>
                  <p className="text-white font-medium text-lg">{formData.email}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Téléphone</span>
                  <p className="text-white font-medium text-lg">{formData.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Date de naissance</span>
                  <p className="text-white font-medium text-lg">{formData.dateOfBirth || 'Non renseigné'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-400 text-sm">Adresse</span>
                  <p className="text-white font-medium text-lg">{formData.address || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Informations médicales</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-400 text-sm">Groupe sanguin</span>
                    <p className="text-white font-medium text-lg">{formData.bloodType || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Allergies</span>
                    <p className="text-white font-medium text-lg">{formData.allergies || 'Aucune'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-blue-100">Rendez-vous total</div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold mb-1">10</div>
            <div className="text-green-100">Consultations terminées</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-3xl font-bold mb-1">5</div>
            <div className="text-purple-100">Ordonnances</div>
          </div>
        </div>
      </main>
    </div>
  )
}

