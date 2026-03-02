'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DoctorAppointmentsPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboards/doctor/appointments/list')
  }, [router])
  return null
}
