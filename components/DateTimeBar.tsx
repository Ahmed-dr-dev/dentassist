'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'

export default function DateTimeBar() {
  const { locale } = useI18n()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!now) return null

  const dateStr = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(now)
  const timeStr = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now)

  return (
    <div className="sticky top-0 z-[100] flex justify-center items-center py-1.5 px-4 bg-gray-800/95 border-b border-gray-700/50 backdrop-blur-sm text-gray-300 text-sm font-medium">
      <span className="tabular-nums">{dateStr}</span>
      <span className="mx-2 text-gray-500">•</span>
      <span className="tabular-nums">{timeStr}</span>
    </div>
  )
}
