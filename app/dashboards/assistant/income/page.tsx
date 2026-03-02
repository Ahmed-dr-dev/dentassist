'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

type Period = 'day' | 'week' | 'month' | 'year'

export default function AssistantIncomePage() {
  const { t, language } = useI18n()
  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar' : 'en-US'
  const [data, setData] = useState<{ statistics: any; startDate: string; endDate: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<Period>('month')

  useEffect(() => {
    fetchIncome()
  }, [period])

  const fetchIncome = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/statistics?period=${period}`)
      if (!response.ok) throw new Error('Failed to load')
      const json = await response.json()
      setData({ statistics: json.statistics, startDate: json.startDate, endDate: json.endDate })
    } catch (err: any) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const periodOptions: { value: Period; labelKey: string }[] = [
    { value: 'day', labelKey: 'income.today' },
    { value: 'week', labelKey: 'income.thisWeek' },
    { value: 'month', labelKey: 'income.thisMonth' },
    { value: 'year', labelKey: 'income.thisYear' }
  ]

  const formatRange = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    return `${s.toLocaleDateString(locale)} – ${e.toLocaleDateString(locale)}`
  }

  if (loading && !data) {
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
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/assistant" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.assistant')}
              </Link>
              <span className="text-gray-500">/ {t('income.title')}</span>
            </div>
            <Link href="/dashboards/assistant" className="text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('income.title')}</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {periodOptions.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
        )}

        {data && (
          <>
            <p className="text-gray-600 text-sm mb-6">
              {formatRange(data.startDate, data.endDate)}
            </p>
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl p-8 text-white max-w-xl">
              <h2 className="text-lg font-semibold mb-2">{t('statistics.rdvIncome')}</h2>
              <p className="text-4xl font-bold">{data.statistics?.totalIncome ?? 0} DT</p>
              <p className="text-emerald-100 text-sm mt-2">
                {data.statistics?.paidAppointmentsCount ?? 0} {t('statistics.paidRdvs')} × {data.statistics?.rdvUnitPrice ?? 70} DT
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
