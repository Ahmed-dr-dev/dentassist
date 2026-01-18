'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
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
        // Redirect to appropriate dashboard based on role
        if (data.user.role === 'doctor') {
          router.push('/dashboards/doctor')
        } else if (data.user.role === 'patient') {
          router.push('/dashboards/patient')
        } else {
          router.push('/')
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
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion')
      }

      // Redirect to appropriate dashboard based on role
      if (data.user.role === 'doctor') {
        router.push('/dashboards/doctor')
      } else if (data.user.role === 'patient') {
        router.push('/dashboards/patient')
      } else {
        router.push('/')
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
          {/* Language Switcher */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

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
            <span className="text-2xl font-bold text-white">{t('common.appName')}</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{t('auth.login')}</h2>
            <p className="text-gray-400">{t('auth.loginSubtitle')}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">
                {t('auth.signupSuccess')}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                placeholder="nom@gmail.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.password')}
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
                {t('auth.forgotPassword')}
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition font-medium text-lg shadow-lg hover:shadow-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('auth.signIn')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400">{t('common.or')}</span>
            </div>
          </div>

        
          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            {t('auth.noAccount')}{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              {t('auth.signUp')}
            </Link>
          </p>

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
            {t('home.dashboardIllustration')}
          </h2>
          <p className="text-xl text-gray-400">
            {t('home.platformDescription')}
          </p>
        </div>
      </div>
   
    </div>
  )
}
