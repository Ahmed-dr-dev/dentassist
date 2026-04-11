'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const token = searchParams.get('token')?.trim() || ''

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
    if (!token) {
      setError(t('auth.resetPasswordInvalidToken'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.validations.minPassword'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(
          response.status === 400
            ? t('auth.resetPasswordInvalidToken')
            : data.error || t('auth.resetPasswordError')
        )
      }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.resetPasswordError'))
    } finally {
      setLoading(false)
    }
  }

  if (!token && !success) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm mb-6">
        {t('auth.resetPasswordInvalidToken')}
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm mb-6">
        {t('auth.resetPasswordSuccess')}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.confirmPassword')}</label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-500 transition font-medium text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('common.loading') : t('auth.resetPasswordSubmit')}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  const { t } = useI18n()

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.resetPasswordTitle')}</h1>
            <p className="text-gray-600">{t('auth.resetPasswordSubtitle')}</p>
          </div>

          <Suspense fallback={<p className="text-gray-600 text-center">{t('common.loading')}</p>}>
            <ResetPasswordForm />
          </Suspense>

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
