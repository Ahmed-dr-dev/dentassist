'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function AdminUsersPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const roleColors: Record<string, string> = {
    admin:     'bg-red-100 text-red-700',
    doctor:    'bg-emerald-100 text-emerald-700',
    assistant: 'bg-teal-100 text-teal-700',
    patient:   'bg-blue-100 text-blue-700',
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users/list?${params}`)
      if (!res.ok) { router.push('/login'); return }
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setError(t('admin.users.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('admin.users.deleteConfirm').replace('{name}', name))) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      setError(t('admin.users.deleteError'))
    } finally {
      setDeletingId(null)
    }
  }

  const roleFilters = [
    { key: 'all', label: t('admin.roles.all') },
    { key: 'admin', label: t('admin.roles.admin') },
    { key: 'doctor', label: t('admin.roles.doctor') },
    { key: 'assistant', label: t('admin.roles.assistant') },
    { key: 'patient', label: t('admin.roles.patient') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/admin" className="text-gray-600 hover:text-gray-900 text-sm">← {t('common.back')}</Link>
              <span className="text-xl font-bold text-gray-900">{t('common.appName')} — <span className="text-red-600">Admin</span></span>
              <span className="text-gray-500 text-sm">/ {t('admin.users.breadcrumb')}</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
              href="/dashboards/admin/users/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('admin.users.create')}
            </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.users.title')}</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              placeholder={t('admin.users.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm transition">
              {t('admin.users.search')}
            </button>
          </form>
          <div className="flex gap-2 flex-wrap">
            {roleFilters.map(r => (
              <button
                key={r.key}
                onClick={() => setRoleFilter(r.key)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition ${roleFilter === r.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600 text-center py-12">{t('common.loading')}</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-600">
            {t('admin.users.noUsers')}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">{t('admin.users.colName')}</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">{t('admin.users.colEmail')}</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">{t('admin.users.colRole')}</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">{t('admin.users.colPhone')}</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">{t('admin.users.colCreatedAt')}</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">{t('admin.users.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${roleColors[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                        {t(`admin.roles.${user.role}` as any) ?? user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboards/admin/users/${user.id}`}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition"
                        >
                          {t('admin.users.edit')}
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id, user.full_name)}
                          disabled={deletingId === user.id}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition disabled:opacity-50"
                        >
                          {deletingId === user.id ? '...' : t('admin.users.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
              {users.length} {users.length > 1 ? t('admin.users.breadcrumb').toLowerCase() : t('admin.roles.patient').toLowerCase()}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
