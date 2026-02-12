'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

const keyToLabelKey: Record<string, string> = {
  basic_rdv: 'basicRdv',
  cleaning: 'cleaning',
  scaling: 'scaling',
  filling: 'filling',
  extraction: 'extraction',
  whitening: 'whitening',
  root_canal: 'rootCanal',
  crown: 'crown'
}

function slugify(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || ''
}

function formatKeyLabel(key: string, t: (k: string) => string): string {
  const labelKey = keyToLabelKey[key]
  if (labelKey) return t(`tariffs.${labelKey}`)
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type TariffRow = { key: string; price: number }

export default function AssistantTariffsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tariffs, setTariffs] = useState<TariffRow[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newPrice, setNewPrice] = useState<number>(0)

  useEffect(() => {
    fetchTariffs()
  }, [])

  const fetchTariffs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tariffs')
      if (!res.ok) throw new Error('Failed to load tariffs')
      const data = await res.json()
      const list = (data.tariffs || []) as { key: string; price: number }[]
      setTariffs(list.map((r) => ({ key: r.key, price: r.price })))
    } catch (e: any) {
      setError(e.message || t('tariffs.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const updatePrice = (key: string, value: number) => {
    setTariffs((prev) =>
      prev.map((r) => (r.key === key ? { ...r, price: value } : r))
    )
  }

  const addTariff = () => {
    const key = slugify(newLabel)
    if (!key) {
      setError(t('tariffs.enterServiceName'))
      return
    }
    if (tariffs.some((r) => r.key === key)) {
      setError(t('tariffs.duplicateKey'))
      return
    }
    setTariffs((prev) => [...prev, { key, price: newPrice >= 0 ? newPrice : 0 }])
    setNewLabel('')
    setNewPrice(0)
    setError('')
  }

  const removeTariff = async (key: string) => {
    try {
      const res = await fetch('/api/tariffs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      if (!res.ok) throw new Error()
      fetchTariffs()
    } catch {
      setError(t('tariffs.deleteError'))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/tariffs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tariffs })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setSuccess(t('tariffs.updateSuccess'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setError(e.message || t('tariffs.updateError'))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetch('/api/auth/user')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== 'assistant') router.push('/')
      })
      .catch(() => router.push('/login'))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/assistant" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.assistant')}
              </Link>
              <span className="text-gray-600">/ {t('tariffs.manage')}</span>
            </div>
            <Link href="/dashboards/assistant" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tariffs.manage')}</h1>
        <p className="text-gray-600 mb-6">{t('tariffs.manageSubtitle')}</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">{success}</div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm border border-gray-200 overflow-hidden mb-6">
          <ul className="divide-y divide-gray-700">
            {tariffs.map((row) => (
              <li key={row.key} className="flex items-center justify-between gap-4 px-6 py-4">
                <span className="text-gray-900 font-medium">
                  {formatKeyLabel(row.key, t)}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={row.price}
                    onChange={(e) => updatePrice(row.key, parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg"
                  />
                  <span className="text-gray-600">{t('tariffs.currency')}</span>
                  <button
                    type="button"
                    onClick={() => removeTariff(row.key)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded"
                    title={t('common.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('tariffs.addNew')}</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-gray-600 text-sm mb-1">{t('tariffs.serviceName')}</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder={t('tariffs.serviceNamePlaceholder')}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">{t('tariffs.currency')}</label>
              <input
                type="number"
                min={0}
                value={newPrice || ''}
                onChange={(e) => setNewPrice(parseInt(e.target.value, 10) || 0)}
                className="w-24 px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg"
              />
            </div>
            <button
              type="button"
              onClick={addTariff}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
            >
              {t('tariffs.add')}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </main>
    </div>
  )
}
