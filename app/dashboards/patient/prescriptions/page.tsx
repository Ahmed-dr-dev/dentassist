'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PrescriptionsPage() {
  const router = useRouter()
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
        throw new Error('Erreur lors du chargement des ordonnances')
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
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
                DentAssist
              </Link>
              <span className="text-gray-400">/ Ordonnances</span>
            </div>
            <Link
              href="/dashboards/patient"
              className="flex items-center text-gray-300 hover:text-white"
            >
              Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Mes Ordonnances</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {prescriptions.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">Aucune ordonnance trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => {
              const doctor = prescription.doctor as any
              const date = new Date(prescription.created_at)

              return (
                <div key={prescription.id} className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {prescription.file_name}
                      </h3>
                      <p className="text-gray-400">
                        Dr. {doctor?.full_name}
                        {doctor?.specialty && ` - ${doctor.specialty}`}
                      </p>
                      {prescription.description && (
                        <p className="text-gray-400 mt-2">{prescription.description}</p>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {date.toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewPDF(prescription.file_path, prescription.file_name)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                    >
                      Voir le PDF
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(prescription.file_path, prescription.file_name)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition"
                    >
                      Télécharger
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
