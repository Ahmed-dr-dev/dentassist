'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const STATUS_STYLES: Record<string, string> = {
  unread:  'bg-blue-100 text-blue-700',
  read:    'bg-gray-100 text-gray-600',
  handled: 'bg-green-100 text-green-700',
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { fetchMessages() }, [statusFilter])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/messages/list?${params}`)
      if (!res.ok) { router.push('/login'); return }
      const data = await res.json()
      setMessages(data.messages || [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch {
      setError(t('messages.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) return
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
      setUnreadCount(prev => {
        const msg = messages.find(m => m.id === id)
        if (msg?.status === 'unread' && status !== 'unread') return Math.max(0, prev - 1)
        if (msg?.status !== 'unread' && status === 'unread') return prev + 1
        return prev
      })
    } catch { /* silent */ }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm(t('messages.deleteConfirm'))) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setMessages(prev => prev.filter(m => m.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const handleExpand = async (msg: any) => {
    if (expandedId === msg.id) { setExpandedId(null); return }
    setExpandedId(msg.id)
    if (msg.status === 'unread') await updateStatus(msg.id, 'read')
  }

  const filters = [
    { key: 'all',     label: t('messages.all') },
    { key: 'unread',  label: t('messages.unread') },
    { key: 'read',    label: t('messages.read') },
    { key: 'handled', label: t('messages.handled') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/admin" className="text-gray-600 hover:text-gray-900 text-sm">← {t('common.back')}</Link>
              <span className="text-xl font-bold text-gray-900">{t('common.appName')} — <span className="text-red-600">Admin</span></span>
              <span className="text-gray-500 text-sm">/ {t('messages.breadcrumb')}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('messages.title')}</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
              {unreadCount} {t('messages.unreadBadge')}
            </span>
          )}
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${statusFilter === f.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'}`}
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">{t('common.loading')}</div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">{t('messages.noMessages')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`bg-white rounded-xl border transition ${msg.status === 'unread' ? 'border-blue-200 shadow-sm shadow-blue-100' : 'border-gray-200'}`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 rounded-xl transition"
                  onClick={() => handleExpand(msg)}
                >
                  {/* Unread dot */}
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${msg.status === 'unread' ? 'bg-blue-500' : 'bg-transparent'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{msg.name}</span>
                      <span className="text-gray-400 text-xs">·</span>
                      <span className="text-gray-500 text-xs">{msg.email}</span>
                      {msg.phone && <><span className="text-gray-400 text-xs">·</span><span className="text-gray-500 text-xs">{msg.phone}</span></>}
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{msg.subject}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${STATUS_STYLES[msg.status]}`}>
                      {t(`messages.${msg.status}` as any)}
                    </span>
                    <span className="text-gray-400 text-xs hidden sm:block">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === msg.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedId === msg.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.status !== 'read' && (
                        <button onClick={() => updateStatus(msg.id, 'read')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition">
                          {t('messages.markRead')}
                        </button>
                      )}
                      {msg.status !== 'handled' && (
                        <button onClick={() => updateStatus(msg.id, 'handled')} className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition">
                          {t('messages.markHandled')}
                        </button>
                      )}
                      {msg.status !== 'unread' && (
                        <button onClick={() => updateStatus(msg.id, 'unread')} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition">
                          {t('messages.markUnread')}
                        </button>
                      )}
                      <a href={`mailto:${msg.email}`} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition">
                        Reply
                      </a>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        disabled={deletingId === msg.id}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition ml-auto disabled:opacity-50"
                      >
                        {deletingId === msg.id ? '...' : t('messages.delete')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
