'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

const BASIC_RDV_PRICE = 70

const EXTRA_TARIFFS = [
  { key: 'cleaning', price: 50 },
  { key: 'scaling', price: 60 },
  { key: 'filling', price: 80 },
  { key: 'extraction', price: 100 },
  { key: 'whitening', price: 250 },
  { key: 'rootCanal', price: 200 },
  { key: 'crown', price: 350 },
]

export default function PatientTariffsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      if (data.user.role !== 'patient') {
        router.push('/')
        return
      }
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
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
              <Link href="/dashboards/patient" className="text-xl font-bold text-white">
                {t('common.appName')}
              </Link>
              <span className="text-gray-400">/ {t('tariffs.title')}</span>
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
        <h1 className="text-3xl font-bold text-white mb-2">{t('tariffs.title')}</h1>
        <p className="text-gray-400 mb-8">{t('tariffs.subtitle')}</p>

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-300 mb-1">{t('tariffs.basicRdv')}</h2>
          <p className="text-3xl font-bold text-white">
            {BASIC_RDV_PRICE} <span className="text-lg font-normal text-gray-400">{t('tariffs.currency')}</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">{t('tariffs.basicRdvDesc')}</p>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">{t('tariffs.extraTitle')}</h2>
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {EXTRA_TARIFFS.map((item) => (
              <li key={item.key} className="flex items-center justify-between px-6 py-4 hover:bg-gray-700/50 transition">
                <span className="text-white">{t(`tariffs.${item.key}`)}</span>
                <span className="font-semibold text-white">
                  {item.price} {t('tariffs.currency')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-sm text-gray-500">{t('tariffs.disclaimer')}</p>
      </main>
    </div>
  )
}
