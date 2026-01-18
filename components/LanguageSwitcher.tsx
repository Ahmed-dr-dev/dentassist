'use client'

import { useI18n } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  return (
    <div className="flex items-center gap-2">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'fr' | 'en' | 'ar')}
        className="px-3 py-1.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-pointer"
      >
        <option value="fr">🇫🇷 FR</option>
        <option value="en">🇬🇧 EN</option>
        <option value="ar">🇹🇳 AR</option>
      </select>
    </div>
  )
}
