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
        } else if (data.user.role === 'assistant') {
          router.push('/dashboards/assistant')
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
      } else if (data.user.role === 'assistant') {
        router.push('/dashboards/assistant')
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
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="relative w-12 h-12">
              <Image src="/logo1.png" alt="DentAssist Logo" width={48} height={48} className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{t('common.appName')}</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login')}</h2>
            <p className="text-gray-600">{t('auth.loginSubtitle')}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                {t('auth.signupSuccess')}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                placeholder="nom@gmail.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500"
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">{t('auth.forgotPassword')}</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-500 transition font-medium text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('auth.signIn')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">{t('common.or')}</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">{t('auth.signUp')}</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 border-l border-gray-200 items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="mb-8 flex items-center justify-center">
            <Image src="/ChatGPT Image Jan 3, 2026, 05_24_31 PM.png" alt="DentAssist Hero" width={500} height={500} className="object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.dashboardIllustration')}</h2>
          <p className="text-xl text-gray-600">{t('home.platformDescription')}</p>
        </div>
      </div>
    </div>
  )
}
