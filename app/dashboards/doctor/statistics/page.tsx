'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

export default function DoctorStatisticsPage() {
  const { t } = useI18n()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchStatistics()
  }, [period])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/statistics?period=${period}`)
      if (!response.ok) throw new Error(t('statistics.fetchError'))
      const data = await response.json()
      setStats(data.statistics)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const periods: { key: 'day' | 'week' | 'month' | 'year'; label: string }[] = [
    { key: 'day',   label: t('income.today') },
    { key: 'week',  label: t('income.thisWeek') },
    { key: 'month', label: t('income.thisMonth') },
    { key: 'year',  label: t('income.thisYear') },
  ]

  const periodLabel = periods.find(p => p.key === period)?.label ?? ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    )
  }

  const statCards = stats ? [
    {
      title: t('statistics.totalAppointments'),
      sub: t('statistics.totalAppointmentsSub'),
      value: stats.totalAppointments ?? 0,
      bg: 'from-blue-600 to-blue-500',
      sub_color: 'text-blue-100',
    },
    {
      title: t('statistics.rejectedAppointments'),
      sub: t('statistics.rejectedSub'),
      value: stats.rejectedAppointments ?? 0,
      bg: 'from-orange-600 to-orange-500',
      sub_color: 'text-orange-100',
    },
    {
      title: t('statistics.cancelledAppointments'),
      sub: t('statistics.cancelledSub'),
      value: stats.cancelledAppointments ?? 0,
      bg: 'from-red-600 to-red-500',
      sub_color: 'text-red-100',
    },
    {
      title: t('statistics.completedAppointments'),
      sub: t('statistics.completedSub'),
      value: stats.completedAppointments ?? 0,
      bg: 'from-purple-600 to-purple-500',
      sub_color: 'text-purple-100',
    },
    {
      title: t('statistics.confirmedAppointments'),
      sub: t('statistics.confirmedSub'),
      value: stats.confirmedAppointments ?? 0,
      bg: 'from-green-600 to-green-500',
      sub_color: 'text-green-100',
    },
    {
      title: t('statistics.totalPatients'),
      sub: t('statistics.totalPatientsSub'),
      value: stats.totalPatients ?? 0,
      bg: 'from-yellow-600 to-yellow-500',
      sub_color: 'text-yellow-100',
    },
    {
      title: t('statistics.prescriptionsTitle'),
      sub: t('statistics.prescriptionsSub'),
      value: stats.prescriptionsCount ?? 0,
      bg: 'from-teal-600 to-teal-500',
      sub_color: 'text-teal-100',
    },
    {
      title: t('statistics.certificatesTitle'),
      sub: t('statistics.certificatesSub'),
      value: stats.certificatCount ?? 0,
      bg: 'from-cyan-600 to-cyan-500',
      sub_color: 'text-cyan-100',
    },
    {
      title: t('statistics.controlsTitle'),
      sub: t('statistics.controlsSub'),
      value: stats.controlDatesCount ?? 0,
      bg: 'from-indigo-600 to-indigo-500',
      sub_color: 'text-indigo-100',
    },
    {
      title: t('statistics.rdvIncome'),
      sub: `${periodLabel} — ${stats.paidAppointmentsCount ?? 0} ${t('statistics.incomeSub').replace('{price}', stats.rdvUnitPrice ?? 70)}`,
      value: `${stats.totalIncome ?? 0} DT`,
      bg: 'from-emerald-600 to-emerald-500',
      sub_color: 'text-emerald-100',
    },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/doctor" className="text-xl font-bold text-gray-900">
                {t('common.appName')}
              </Link>
              <span className="text-gray-500">/ {t('statistics.title')}</span>
            </div>
            <Link href="/dashboards/doctor" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('statistics.title')}</h1>
          <div className="flex gap-2 flex-wrap">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-lg transition ${
                  period === p.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, i) => (
              <div key={i} className={`bg-gradient-to-br ${card.bg} rounded-xl p-6 text-white`}>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-4xl font-bold">{card.value}</p>
                <p className={`${card.sub_color} text-sm mt-2`}>{card.sub}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
