'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function RequestAppointmentPage() {
  const router = useRouter()
  const { t } = useI18n()
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
        throw new Error(data.error || t('appointments.requestError'))
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
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/patient" className="text-xl font-bold text-white">
                {t('common.appName')}
              </Link>
              <span className="text-gray-400">/ {t('appointments.request')}</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/dashboards/patient"
                className="flex items-center text-gray-300 hover:text-white"
              >
                {t('common.back')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">{t('appointments.request')}</h1>

        {error && !rejectionData && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
            {success}
          </div>
        )}

        {rejectionData && (
          <div className="mb-6 p-6 bg-yellow-500/20 border border-yellow-500 rounded-lg">
            <h3 className="text-yellow-300 font-bold mb-4">{t('appointments.slotUnavailable')}</h3>
            <p className="text-yellow-200 mb-4">{rejectionData.reason}</p>

            {!showExternalDentists && rejectionData.availableSlots && rejectionData.availableSlots.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">{t('appointments.alternativeSlots')}:</h4>
                <div className="space-y-2 mb-4">
                  {rejectionData.availableSlots.map((slot: string, idx: number) => {
                    const date = new Date(slot)
                    const dateStr = date.toLocaleDateString('fr-FR')
                    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    return (
                      <button
                        key={idx}
                        onClick={() => handleConfirmAlternative(slot)}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50"
                      >
                        {dateStr} à {timeStr}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setShowExternalDentists(true)}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  {t('appointments.declineAlternatives')} - {t('externalDentists.title')}
                </button>
              </div>
            )}

            {(showExternalDentists || (!rejectionData.availableSlots || rejectionData.availableSlots.length === 0)) && rejectionData.externalDentists && rejectionData.externalDentists.length > 0 && (
              <div>
                  <h4 className="text-white font-semibold mb-3">{t('externalDentists.title')}:</h4>
                <div className="space-y-3">
                  {rejectionData.externalDentists.map((dentist: any) => (
                    <div key={dentist.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <p className="text-white font-bold text-lg mb-1">{dentist.name}</p>
                      {dentist.specialty && (
                        <p className="text-blue-400 text-sm mb-2">{dentist.specialty}</p>
                      )}
                      <p className="text-gray-400 text-sm mb-1">
                        <span className="text-gray-500">📍</span> {dentist.address}
                      </p>
                      <p className="text-gray-400 text-sm">
                        <span className="text-gray-500">📞</span> {dentist.phone}
                      </p>
                    </div>
                  ))}
                </div>
                {!showExternalDentists && (
                  <button
                    onClick={() => setShowExternalDentists(true)}
                    className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    {t('externalDentists.title')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 rounded-xl p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('appointments.date')} *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('appointments.time')} *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('appointments.reason')} ({t('common.optional')})
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={t('appointments.reason')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('medical.medicalHistory')} ({t('common.optional')})
            </label>
            <textarea
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ex: Diabète, Hypertension, Allergies, Maladies cardiaques, etc."
            />
            <p className="mt-1 text-xs text-gray-400">
              {t('medical.medicalHistoryNote')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('medical.currentMedications')} ({t('common.optional')})
            </label>
            <textarea
              value={formData.currentMedications}
              onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ex: Aspirine 100mg/jour, Insuline, Anticoagulants, etc."
            />
            <p className="mt-1 text-xs text-gray-400">
              {t('medical.medicationsNote')}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.loading') : t('appointments.request')}
          </button>
        </form>
      </main>
    </div>
  )
}
