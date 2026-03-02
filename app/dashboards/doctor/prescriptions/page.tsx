'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DoctorPrescriptionsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      // Get confirmed or completed appointments (for which we can assign prescriptions)
      const response = await fetch('/api/appointments/doctor/list?period=month')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
      const data = await response.json()
      const confirmedAppointments = (data.appointments || []).filter(
        (apt: any) => apt.status === 'confirmed' || apt.status === 'completed'
      )
      setAppointments(confirmedAppointments)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== 'application/pdf') {
        setError('Le fichier doit être un PDF')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAppointment || !file) {
      setError('Veuillez sélectionner un rendez-vous et un fichier PDF')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('appointmentId', selectedAppointment)
      formData.append('file', file)
      if (description) {
        formData.append('description', description)
      }

      const response = await fetch('/api/prescriptions/create', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'assignation')
      }

      setSuccess('Ordonnance assignée avec succès')
      setSelectedAppointment(null)
      setFile(null)
      setDescription('')

      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboards/doctor" className="text-xl font-bold text-gray-900">
                DentAssist
              </Link>
              <span className="text-gray-500">/ Assigner une ordonnance</span>
            </div>
            <Link
              href="/dashboards/doctor"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Assigner une ordonnance</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rendez-vous
            </label>
            <select
              required
              value={selectedAppointment || ''}
              onChange={(e) => setSelectedAppointment(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Sélectionner un rendez-vous</option>
              {appointments.map((appointment) => {
                const patient = appointment.patient as any
                const dateTime = appointment.confirmed_date_time
                  ? formatDateTime(appointment.confirmed_date_time)
                  : formatDateTime(appointment.requested_date_time)
                return (
                  <option key={appointment.id} value={appointment.id}>
                    {patient?.full_name} - {dateTime.date} à {dateTime.time}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-500">Fichier sélectionné : {file.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Description de l'ordonnance..."
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedAppointment || !file}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Upload...' : 'Assigner l\'ordonnance'}
          </button>
        </form>
      </main>
    </div>
  )
}
