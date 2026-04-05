'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

export default function DoctorProfilePage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
  })
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    phone: '',
    specialty: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t('profile.loadError'))
      }
      const data = await response.json()
      setFormData({
        fullName: data.user.fullName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        specialty: data.user.specialty || '',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validateName = (name: string): string => {
    if (!name) return t('profile.nameRequired')
    if (name.length < 2) return t('profile.nameMinChars')
    return ''
  }

  const validatePhone = (phone: string): string => {
    if (!phone) return t('profile.phoneRequired')
    const cleanPhone = phone.replace(/[\s-]/g, '')
    const phoneRegex = /^(\+?\d{1,3}[\s-]?)?\d{8,15}$/
    if (!phoneRegex.test(cleanPhone)) return t('profile.phoneInvalid')
    return ''
  }

  const validateSpecialty = (specialty: string): string => {
    if (!specialty) return t('profile.specialtyRequired')
    if (specialty.length < 2) return t('profile.specialtyMinChars')
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const nameError = validateName(formData.fullName)
    const phoneError = validatePhone(formData.phone)
    const specialtyError = validateSpecialty(formData.specialty)

    setFieldErrors({
      fullName: nameError,
      phone: phoneError,
      specialty: specialtyError,
    })

    if (nameError || phoneError || specialtyError) return

    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          specialty: formData.specialty.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('profile.updateError'))

      setSuccess(t('profile.updateSuccess'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/doctor" className="text-xl font-bold text-gray-900">
                {t('common.appName')}
              </Link>
              <span className="text-gray-500">/ {t('profile.title')}</span>
            </div>
            <Link href="/dashboards/doctor" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('profile.title')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.fullName')}</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value })
                if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: validateName(e.target.value) })
              }}
              onBlur={(e) => setFieldErrors({ ...fieldErrors, fullName: validateName(e.target.value) })}
              className={`w-full px-4 py-3 bg-white border text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldErrors.fullName && <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">{t('profile.emailCannotEdit')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.phone')}</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value })
                if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: validatePhone(e.target.value) })
              }}
              onBlur={(e) => setFieldErrors({ ...fieldErrors, phone: validatePhone(e.target.value) })}
              className={`w-full px-4 py-3 bg-white border text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+21612345678"
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.specialty')}</label>
            <input
              type="text"
              required
              value={formData.specialty}
              onChange={(e) => {
                setFormData({ ...formData, specialty: e.target.value })
                if (fieldErrors.specialty) setFieldErrors({ ...fieldErrors, specialty: validateSpecialty(e.target.value) })
              }}
              onBlur={(e) => setFieldErrors({ ...fieldErrors, specialty: validateSpecialty(e.target.value) })}
              className={`w-full px-4 py-3 bg-white border text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                fieldErrors.specialty ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('profile.specialtyPlaceholder')}
            />
            {fieldErrors.specialty && <p className="mt-1 text-xs text-red-400">{fieldErrors.specialty}</p>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('profile.saving') : t('profile.saveChanges')}
          </button>
        </form>
      </main>
    </div>
  )
}
