'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function AssistantProfilePage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  })
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    phone: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      if (data.user.role !== 'assistant') {
        router.push('/')
        return
      }
      setFormData({
        fullName: data.user.fullName || '',
        email: data.user.email || '',
        phone: data.user.phone || ''
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validateName = (name: string): string => {
    if (!name) return 'Le nom est requis'
    if (name.length < 2) return 'Le nom doit contenir au moins 2 caractères'
    return ''
  }

  const validatePhone = (phone: string): string => {
    if (!phone) return 'Le numéro de téléphone est requis'
    const cleanPhone = phone.replace(/[\s-]/g, '')
    const phoneRegex = /^(\+?\d{1,3}[\s-]?)?\d{8,15}$/
    if (!phoneRegex.test(cleanPhone)) return 'Format de téléphone invalide'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const nameError = validateName(formData.fullName)
    const phoneError = validatePhone(formData.phone)
    setFieldErrors({ fullName: nameError, phone: phoneError })
    if (nameError || phoneError) return
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: formData.fullName.trim(), phone: formData.phone.trim() })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la mise à jour')
      setSuccess('Profil mis à jour avec succès')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/assistant" className="text-xl font-bold text-white">
                {t('common.appName')} - {t('dashboard.assistant')}
              </Link>
              <span className="text-gray-400">/ {t('profile.title')}</span>
            </div>
            <Link href="/dashboards/assistant" className="flex items-center text-gray-300 hover:text-white">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">{t('profile.title')}</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">{success}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.fullName')} *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value })
                if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: validateName(e.target.value) })
              }}
              onBlur={(e) => setFieldErrors({ ...fieldErrors, fullName: validateName(e.target.value) })}
              className={`w-full px-4 py-3 bg-gray-700 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-600'}`}
            />
            {fieldErrors.fullName && <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.email')}</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.phone')} *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value })
                if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: validatePhone(e.target.value) })
              }}
              onBlur={(e) => setFieldErrors({ ...fieldErrors, phone: validatePhone(e.target.value) })}
              className={`w-full px-4 py-3 bg-gray-700 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${fieldErrors.phone ? 'border-red-500' : 'border-gray-600'}`}
              placeholder="+21612345678"
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </main>
    </div>
  )
}
