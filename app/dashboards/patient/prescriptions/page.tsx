'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar' }

export default function PrescriptionsPage() {
  const router = useRouter()
  const { t, language } = useI18n()
  const locale = localeMap[language] || 'fr-FR'
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions/list')
      if (!response.ok) {
        throw new Error(t('prescriptions.loadError'))
      }
      const data = await response.json()
      setPrescriptions(data.prescriptions || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPDF = (filePath: string, fileName: string) => {
    // Open PDF in new tab
    window.open(filePath, '_blank')
  }

  const handleDownloadPDF = (filePath: string, fileName: string) => {
    // Create a link to download the PDF
    const link = document.createElement('a')
    link.href = filePath
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <span className="text-gray-500">/ {t('prescriptions.title')}</span>
            </div>
            <Link href="/dashboards/patient" className="flex items-center text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('prescriptions.myPrescriptions')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
        )}

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
            <p className="text-gray-600">{t('prescriptions.noPrescriptions')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => {
              const doctor = prescription.doctor as any
              const date = new Date(prescription.created_at)

              return (
                <div key={prescription.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{prescription.file_name}</h3>
                      <p className="text-gray-600">
                        Dr. {doctor?.full_name}
                        {doctor?.specialty && ` - ${doctor.specialty}`}
                      </p>
                      {prescription.description && (
                        <p className="text-gray-600 mt-2">{prescription.description}</p>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {date.toLocaleDateString(locale)}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewPDF(prescription.file_path, prescription.file_name)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                    >
                      {t('prescriptions.viewPDF')}
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(prescription.file_path, prescription.file_name)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition"
                    >
                      {t('prescriptions.download')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
