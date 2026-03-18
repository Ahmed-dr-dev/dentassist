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
  const [replyModal, setReplyModal] = useState<{ name: string; email: string; phone?: string } | null>(null)

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
                      <button
                        onClick={() => setReplyModal({ name: msg.name, email: msg.email, phone: msg.phone })}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition"
                      >
                        Reply
                      </button>
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

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReplyModal(null)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            {/* Close */}
            <button
              onClick={() => setReplyModal(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Contacter le visiteur</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Choisissez comment contacter <span className="font-semibold text-gray-700">{replyModal.name}</span>
            </p>

            <div className="space-y-3">
              {/* Email */}
              <a
                href={`mailto:${replyModal.email}`}
                onClick={() => setReplyModal(null)}
                className="flex items-center gap-4 w-full p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition group"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Répondre par email</p>
                  <p className="text-sm font-medium text-gray-900">{replyModal.email}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 ml-auto transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Phone */}
              {replyModal.phone ? (
                <a
                  href={`tel:${replyModal.phone.replace(/\s/g, '')}`}
                  onClick={() => setReplyModal(null)}
                  className="flex items-center gap-4 w-full p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition group"
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Appeler par téléphone</p>
                    <p className="text-sm font-medium text-gray-900">{replyModal.phone}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 ml-auto transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <div className="flex items-center gap-4 w-full p-4 rounded-xl border border-dashed border-gray-200 opacity-50 cursor-not-allowed">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Appeler par téléphone</p>
                    <p className="text-sm text-gray-400">Aucun numéro renseigné</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setReplyModal(null)}
              className="mt-5 w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
