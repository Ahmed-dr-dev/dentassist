'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function AdminEditUserPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    phone: '',
    specialty: '',
    password: '',
  })
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(data => {
        const u = data.user
        setEmail(u.email)
        setFormData({ fullName: u.full_name, role: u.role, phone: u.phone || '', specialty: u.specialty || '', password: '' })
      })
      .catch(() => router.push('/dashboards/admin/users'))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const body: any = { fullName: formData.fullName, role: formData.role, phone: formData.phone, specialty: formData.specialty }
      if (formData.password) body.password = formData.password

      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(t('admin.users.updateSuccess'))
      setFormData(prev => ({ ...prev, password: '' }))
    } catch {
      setError(t('admin.users.unexpectedError'))
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/admin/users" className="text-gray-600 hover:text-gray-900 text-sm">← {t('admin.users.breadcrumb')}</Link>
              <span className="text-xl font-bold text-gray-900">{t('common.appName')} — <span className="text-red-600">Admin</span></span>
              <span className="text-gray-500 text-sm">/ {t('admin.users.editBreadcrumb')}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.users.editTitle')}</h1>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">{t('admin.users.emailReadonly')}</p>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.users.fullName')} *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.users.role')} *</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="patient">{t('admin.roles.patient')}</option>
                <option value="doctor">{t('admin.roles.doctor')}</option>
                <option value="assistant">{t('admin.roles.assistant')}</option>
                <option value="admin">{t('admin.roles.admin')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+216 XX XXX XXX"
              />
            </div>

            {formData.role === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.specialty')}</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.users.newPassword')} <span className="text-gray-400">{t('admin.users.newPasswordHint')}</span>
              </label>
              <input
                type="password"
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('admin.users.passwordPlaceholder')}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition shadow-sm disabled:opacity-50"
              >
                {saving ? t('admin.users.saving') : t('profile.saveChanges')}
              </button>
              <Link
                href="/dashboards/admin/users"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition text-center"
              >
                {t('common.back')}
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
