'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function RequestAppointmentPage() {
  const router = useRouter()
  const { t, language } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rejectionData, setRejectionData] = useState<any>(null)
  const [showExternalDentists, setShowExternalDentists] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    medicalHistory: '',
    currentMedications: ''
  })

  const minDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setRejectionData(null)
    setLoading(true)

    try {
      if (!formData.date || !formData.time) {
        setError(t('appointments.requiredFields'))
        setLoading(false)
        return
      }

      const requestedDateTime = new Date(`${formData.date}T${formData.time}`).toISOString()
      const minRequestTime = Date.now() + 24 * 60 * 60 * 1000
      if (new Date(requestedDateTime).getTime() < minRequestTime) {
        setError(t('appointments.min24h'))
        setLoading(false)
        return
      }

      const response = await fetch('/api/appointments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedDateTime,
          reason: formData.reason || null,
          medicalHistory: formData.medicalHistory || null,
          currentMedications: formData.currentMedications || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const message = response.status === 400 && data.error?.includes('24 hours')
          ? t('appointments.min24h')
          : (data.error || t('appointments.requestError'))
        throw new Error(message)
      }

      if (data.rejected) {
        setRejectionData(data)
        setError(t('appointments.slotUnavailable'))
      } else {
        setSuccess(t('appointments.requestSuccess'))
        setTimeout(() => {
          router.push('/dashboards/patient/appointments')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAlternative = async (alternativeDateTime: string) => {
    setLoading(true)
    setError('')
    setSuccess('')
    setShowExternalDentists(false)

    try {
      const response = await fetch('/api/appointments/confirm-alternative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alternativeDateTime,
          reason: formData.reason || null,
          medicalHistory: formData.medicalHistory || null,
          currentMedications: formData.currentMedications || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('appointments.confirmError'))
      }

      setSuccess(t('appointments.confirmSuccess'))
      setTimeout(() => {
        router.push('/dashboards/patient/appointments')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/patient" className="text-xl font-bold text-gray-900">{t('common.appName')}</Link>
              <span className="text-gray-500">/ {t('appointments.request')}</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link href="/dashboards/patient" className="flex items-center text-gray-600 hover:text-gray-900">{t('common.back')}</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('appointments.request')}</h1>

        {error && !rejectionData && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">{success}</div>
        )}

        {rejectionData && (
          <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="text-amber-800 font-bold mb-4">{t('appointments.slotUnavailable')}</h3>
            <p className="text-amber-700 mb-4">{rejectionData.reason}</p>

            {!showExternalDentists && rejectionData.availableSlots && rejectionData.availableSlots.length > 0 && (
              <div className="mb-6">
                <h4 className="text-gray-900 font-semibold mb-3">{t('appointments.alternativeSlots')}:</h4>
                <div className="space-y-2 mb-4">
                  {rejectionData.availableSlots.map((slot: string, idx: number) => {
                    const date = new Date(slot)
                    const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar' : 'en-US'
                    const dateStr = date.toLocaleDateString(locale)
                    const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
                    return (
                      <button
                        key={idx}
                        onClick={() => handleConfirmAlternative(slot)}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition disabled:opacity-50"
                      >
                        {dateStr}{t('common.at')}{timeStr}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setShowExternalDentists(true)}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition"
                >
                  {t('appointments.declineAlternatives')} - {t('externalDentists.title')}
                </button>
              </div>
            )}

            {(showExternalDentists || (!rejectionData.availableSlots || rejectionData.availableSlots.length === 0)) && rejectionData.externalDentists && rejectionData.externalDentists.length > 0 && (
              <div>
                <h4 className="text-gray-900 font-semibold mb-3">{t('externalDentists.title')}:</h4>
                <div className="space-y-3">
                  {rejectionData.externalDentists.map((dentist: any) => (
                    <div key={dentist.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-gray-900 font-bold text-lg mb-1">{dentist.name}</p>
                      {dentist.specialty && <p className="text-blue-600 text-sm mb-2">{dentist.specialty}</p>}
                      <p className="text-gray-600 text-sm mb-1">📍 {dentist.address}</p>
                      <p className="text-gray-600 text-sm">📞 {dentist.phone}</p>
                    </div>
                  ))}
                </div>
                {!showExternalDentists && (
                  <button
                    onClick={() => setShowExternalDentists(true)}
                    className="mt-4 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition"
                  >
                    {t('externalDentists.title')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointments.date')}</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={minDate}
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">{t('appointments.min24hNote')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointments.time')}</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointments.reason')} ({t('common.optional')})</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={t('appointments.reason')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('medical.medicalHistory')} ({t('common.optional')})</label>
            <textarea
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ex: Diabète, Hypertension, Allergies, Maladies cardiaques, etc."
            />
            <p className="mt-1 text-xs text-gray-500">{t('medical.medicalHistoryNote')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('medical.currentMedications')} ({t('common.optional')})</label>
            <textarea
              value={formData.currentMedications}
              onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={t('medical.medicationsPlaceholder')}
            />
            <p className="mt-1 text-xs text-gray-500">{t('medical.medicationsNote')}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.loading') : t('appointments.request')}
          </button>
        </form>
      </main>
    </div>
  )
}
