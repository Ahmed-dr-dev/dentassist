'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: ''
  })

  useEffect(() => {
    // Check if already logged in
    checkIfLoggedIn()
  }, [])

  const checkIfLoggedIn = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        // User is already logged in, redirect to dashboard
        router.push('/dashboard/patient')
      }
    } catch (error) {
      // User not logged in, stay on signup page
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: `${formData.firstName} ${formData.lastName}`,
          role: 'patient',
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      // Redirect to login page after successful signup
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="relative w-12 h-12">
              <Image 
                src="/logo1.png" 
                alt="DentAssist Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">DentAssist</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Bienvenue sur DentAssist</h2>
            <p className="text-gray-400">Créez votre compte - C'est gratuit</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nom@entreprise.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
              />
            </div>

            {/* Full Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Ahmed"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Benali"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="0612345678"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">Minimum 6 caractères</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition font-medium text-lg shadow-lg hover:shadow-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription...' : 'Continuer'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400">Ou</span>
            </div>
          </div>

        

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Se connecter
            </Link>
          </p>

          {/* Language Selector */}
          <div className="mt-6 flex justify-center">
            <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
              <option>🇫🇷 Français</option>
              <option>🇬🇧 English</option>
              <option>🇸🇦 العربية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-800 via-gray-900 to-black items-center justify-center p-12 relative overflow-hidden">
        {/* Animated Background Circles */}
        
        <div className="relative z-10 text-center">
          {/* Illustration Placeholder */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              {/* Dashboard Card Illustration */}
          <Image src="/ChatGPT Image Jan 3, 2026, 05_24_31 PM.png" alt="DentAssist Hero" width={500} height={500} className="object-contain" />
              
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            Gérez vos rendez-vous facilement
          </h2>
          <p className="text-xl text-gray-400">
            Plateforme complète pour la gestion de votre cabinet dentaire
          </p>
        </div>
      </div>
    </div>
  )
}

