'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

const FALLBACK_BASIC = 70
const FALLBACK_EXTRAS: { key: string; price: number }[] = [
  { key: 'cleaning', price: 50 },
  { key: 'scaling', price: 60 },
  { key: 'filling', price: 80 },
  { key: 'extraction', price: 100 },
  { key: 'whitening', price: 250 },
  { key: 'root_canal', price: 200 },
  { key: 'crown', price: 350 },
]

const keyToLabelKey: Record<string, string> = {
  basic_rdv: 'basicRdv',
  cleaning: 'cleaning',
  scaling: 'scaling',
  filling: 'filling',
  extraction: 'extraction',
  whitening: 'whitening',
  root_canal: 'rootCanal',
  crown: 'crown',
}

function formatTariffLabel(key: string, t: (k: string) => string): string {
  const labelKey = keyToLabelKey[key]
  if (labelKey) return t(`tariffs.${labelKey}`)
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PatientTariffsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [basicPrice, setBasicPrice] = useState(FALLBACK_BASIC)
  const [extraTariffs, setExtraTariffs] = useState<{ key: string; price: number }[]>(FALLBACK_EXTRAS)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    fetch('/api/tariffs')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        const list = (data.tariffs || []) as { key: string; price: number }[]
        const byKey: Record<string, number> = {}
        list.forEach((r) => { byKey[r.key] = r.price })
        if (typeof byKey.basic_rdv === 'number') setBasicPrice(byKey.basic_rdv)
        const extrasFromApi = list.filter((r) => r.key !== 'basic_rdv').map((r) => ({ key: r.key, price: r.price }))
        if (extrasFromApi.length > 0) {
          setExtraTariffs(extrasFromApi)
        } else {
          setExtraTariffs(FALLBACK_EXTRAS.map(({ key, price: fallback }) => ({ key, price: byKey[key] ?? fallback })))
        }
      })
      .catch(() => {})
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
              <Link href="/dashboards/patient" className="text-xl font-bold text-gray-900">
                {t('common.appName')}
              </Link>
              <span className="text-gray-500">/ {t('tariffs.title')}</span>
            </div>
            <Link
              href="/dashboards/patient"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tariffs.title')}</h1>
        <p className="text-gray-600 mb-8">{t('tariffs.subtitle')}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-1">{t('tariffs.basicRdv')}</h2>
          <p className="text-3xl font-bold text-gray-900">
            {basicPrice} <span className="text-lg font-normal text-gray-500">{t('tariffs.currency')}</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">{t('tariffs.basicRdvDesc')}</p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('tariffs.extraTitle')}</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <ul className="divide-y divide-gray-200">
            {extraTariffs.map((item) => (
              <li key={item.key} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                <span className="text-gray-900">{formatTariffLabel(item.key, t)}</span>
                <span className="font-semibold text-gray-900">
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
