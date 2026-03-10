'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

export default function DoctorCertificatMedicalPage() {
  const { t } = useI18n()
  const [patients, setPatients] = useState<{ id: string; full_name: string }[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [otherName, setOtherName] = useState('')
  const [patientDob, setPatientDob] = useState('')
  const [certificateDate, setCertificateDate] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('')
  const [observations, setObservations] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch('/api/patients/list')
      .then((res) => res.json())
      .then((data) => {
        setPatients((data.patients || []).map((p: any) => ({ id: p.id, full_name: p.full_name || '' })).filter((p: { full_name: string }) => p.full_name))
      })
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false))
  }, [])

  const patientName = selectedPatientId === 'other' ? otherName.trim() : (patients.find((p) => p.id === selectedPatientId)?.full_name ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!patientName || !certificateDate || !reason.trim()) {
      setError(t('certificat.fieldsRequired'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/certificat-medical/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientDob: patientDob || null,
          certificateDate,
          reason: reason.trim(),
          duration: duration.trim() || null,
          observations: observations.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      const url = data.filePath
      setSuccess(t('certificat.saved'))
      window.open(url, '_blank')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/doctor" className="text-xl font-bold text-gray-900">
                {t('common.appName')} - {t('dashboard.doctor')}
              </Link>
              <span className="text-gray-500">/ {t('certificat.title')}</span>
            </div>
            <Link href="/dashboards/doctor" className="text-gray-600 hover:text-gray-900">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('certificat.title')}</h1>
        <p className="text-gray-600 text-sm mb-6">{t('certificat.subtitle')}</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('certificat.patientName')}</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              disabled={loadingPatients}
            >
              <option value="">{t('certificat.selectPatient')}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
              <option value="other">{t('certificat.otherPatient')}</option>
            </select>
            {selectedPatientId === 'other' && (
              <input
                type="text"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                placeholder={t('certificat.patientNamePlaceholder')}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('certificat.patientDob')}</label>
            <input
              type="date"
              value={patientDob}
              onChange={(e) => setPatientDob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('certificat.certificateDate')}</label>
            <input
              type="date"
              value={certificateDate}
              onChange={(e) => setCertificateDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('certificat.reason')}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder={t('certificat.reasonPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('certificat.duration')}</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder={t('certificat.durationPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('certificat.observations')}</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder={t('certificat.observationsPlaceholder')}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
            >
              {loading ? t('common.loading') : t('certificat.generateAndDownload')}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
