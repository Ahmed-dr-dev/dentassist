'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    // Check if already logged in
    checkIfLoggedIn()
    
    if (searchParams.get('registered') === 'true') {
      setSuccess('Inscription réussie ! Connectez-vous maintenant.')
    }
  }, [searchParams])

  const checkIfLoggedIn = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        // User is already logged in, redirect to dashboard
        if (data.user.role === 'dentist') {
          router.push('/dashboard/dentist')
        } else {
          router.push('/dashboard/patient')
        }
      }
    } catch (error) {
      // User not logged in, stay on login page
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
console.log(data)
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion')
      }

      // Redirect based on user role
      if (data.user.role === 'dentist') {
        router.push('/dashboard/dentist')
      } else {
        router.push('/dashboard/patient')
      }
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
            <h2 className="text-3xl font-bold text-white mb-2">Bienvenue</h2>
            <p className="text-gray-400">Commencez - C'est gratuit. Aucune carte de crédit requise.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">
                {success}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition font-medium text-lg shadow-lg hover:shadow-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
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

        
          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Vous avez déjà un compte ?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
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
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center">
          {/* Illustration Placeholder */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              {/* Calendar/Appointment Card Illustration */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-96 h-72">
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="h-3 bg-gray-700 rounded w-24 mb-1"></div>
                        <div className="h-2 bg-gray-800 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Appointment Slots */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-600/20 rounded-lg border-l-4 border-green-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="flex-1 h-3 bg-green-600/30 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-600/20 rounded-lg border-l-4 border-blue-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="flex-1 h-3 bg-blue-600/30 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-600/20 rounded-lg border-l-4 border-purple-500">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="flex-1 h-3 bg-purple-600/30 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-xl flex items-center justify-center animate-bounce">
                <span className="text-2xl">😊</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-xl animate-pulse"></div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            Accédez à votre espace
          </h2>
          <p className="text-xl text-gray-400">
            Gérez vos rendez-vous en toute simplicité
          </p>
        </div>
      </div>
    </div>
  )
}
