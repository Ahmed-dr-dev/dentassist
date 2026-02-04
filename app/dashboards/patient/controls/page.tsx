'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function PatientControlsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [controlDates, setControlDates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchControls()
  }, [])

  const fetchControls = async () => {
    try {
      const response = await fetch('/api/control-dates/list')
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || t('controls.loadError'))
      }
      const data = await response.json()
      setControlDates(data.controlDates || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return {
      date: d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    }
  }

  const now = new Date()
  const isUpcoming = (dateString: string) => new Date(dateString) >= now

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
              <Link href="/dashboards/patient" className="text-xl font-bold text-white">
                {t('common.appName')}
              </Link>
              <span className="text-gray-400">/ {t('controls.title')}</span>
            </div>
            <Link
              href="/dashboards/patient"
              className="flex items-center text-gray-300 hover:text-white"
            >
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('controls.title')}</h1>
        <p className="text-gray-400 mb-8">{t('controls.subtitle')}</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {controlDates.length === 0 && !error && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <p className="text-gray-400">{t('controls.noControls')}</p>
            <p className="text-gray-500 text-sm mt-2">{t('controls.noControlsHint')}</p>
          </div>
        )}

        {controlDates.length > 0 && (
          <ul className="space-y-4">
            {controlDates.map((c: any) => {
              const { date, time } = formatDate(c.control_date_time)
              const upcoming = isUpcoming(c.control_date_time)
              const doctor = c.doctor
              const doctorName = doctor?.full_name || t('controls.doctor')
              return (
                <li
                  key={c.id}
                  className={`rounded-xl border p-6 transition ${
                    upcoming
                      ? 'bg-blue-500/10 border-blue-500/40'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold text-lg">{date}</p>
                      <p className="text-gray-300">{time}</p>
                      {doctorName && (
                        <p className="text-gray-400 text-sm mt-1">
                          {t('controls.setBy')} {doctorName}
                          {doctor?.specialty && ` · ${doctor.specialty}`}
                        </p>
                      )}
                      {c.notes && (
                        <p className="text-gray-400 text-sm mt-2">{c.notes}</p>
                      )}
                    </div>
                    {upcoming && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        {t('controls.upcoming')}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}

