'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const check = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) router.push('/')
      } catch {
        /* stay */
      }
    }
    check()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || t('auth.forgotPasswordError'))
      }
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.forgotPasswordError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
              ← {t('auth.login')}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.forgotPasswordTitle')}</h1>
            <p className="text-gray-600">{t('auth.forgotPasswordSubtitle')}</p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm mb-6">
              {t('auth.forgotPasswordSent')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-500 transition font-medium text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('auth.forgotPasswordSubmit')}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">{t('auth.forgotPasswordBackToLogin')}</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 border-l border-gray-200 items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="mb-8 flex items-center justify-center">
            <Image src="/ChatGPT Image Jan 3, 2026, 05_24_31 PM.png" alt="DentAssist" width={500} height={500} className="object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.dashboardIllustration')}</h2>
          <p className="text-xl text-gray-600">{t('home.platformDescription')}</p>
        </div>
      </div>
    </div>
  )
}
