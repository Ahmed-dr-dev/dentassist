'use client'

import { useState, useRef, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

const TRIGGERS: { triggers: string[]; key: string }[] = [
  { triggers: ['heure', 'ouverture', 'ouvert', 'schedule', 'hours', 'horaire', 'jour', 'when', 'open', 'fermé', 'closed'], key: 'chatbot.hours' },
  { triggers: ['prendre', 'rdv', 'rendez-vous', 'book', 'appointment', 'reserver', 'reservation', 'réserver'], key: 'chatbot.booking' },
  { triggers: ['contact', 'téléphone', 'telephone', 'email', 'adresse', 'phone', 'adress', 'appeler', 'joindre', 'reach'], key: 'chatbot.contact' },
  { triggers: ['tarif', 'prix', 'price', 'cost', 'payer', 'pay', 'cout', 'fee', 'frais'], key: 'chatbot.tariffs' },
  { triggers: ['annuler', 'cancel', 'annulation', 'supprimer', 'cancel appointment'], key: 'chatbot.cancel' },
  { triggers: ['ordonnance', 'prescription', 'ordonnances', 'prescriptions'], key: 'chatbot.prescriptions' },
  { triggers: ['controle', 'control', 'suivi', 'follow', 'follow-up'], key: 'chatbot.controls' },
  { triggers: ['premier', 'first', 'first time', 'nouveau', 'new patient', 'première visite'], key: 'chatbot.firstVisit' },
  { triggers: ['urgence', 'emergency', 'douleur', 'pain', 'urgent'], key: 'chatbot.emergency' },
  { triggers: ['où', 'where', 'localisation', 'location', 'trouver', 'find', 'adresse'], key: 'chatbot.location' },
  { triggers: ['bonjour', 'hello', 'salut', 'hi', 'aide', 'help', 'coucou', 'hey'], key: 'chatbot.greeting' },
  { triggers: ['merci', 'thanks', 'thank you'], key: 'chatbot.thanks' },
]

type Message = { role: 'user' | 'bot'; text: string }

const TYPING_DELAY_MS = 900

export default function PatientChatbot() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, typing])

  const getReply = (userText: string): string => {
    const lower = userText.trim().toLowerCase()
    if (!lower) return t('chatbot.default')
    for (const { triggers, key } of TRIGGERS) {
      if (triggers.some((w) => lower.includes(w))) return t(key)
    }
    return t('chatbot.default')
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setTyping(true)
    const reply = getReply(text)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [...prev, { role: 'bot', text: reply }])
    }, TYPING_DELAY_MS)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center justify-center transition hover:scale-105 active:scale-95"
        aria-label={t('chatbot.title')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col max-h-[520px] overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                D
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" title={t('chatbot.online')} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-gray-900 block">{t('chatbot.botName')}</span>
              <span className="text-xs text-green-600">{t('chatbot.online')}</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px] bg-gray-50">
            {messages.length === 0 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  D
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-200 text-gray-700 px-4 py-3 text-sm leading-relaxed shadow-sm">
                  {t('chatbot.welcome')}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {m.role === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    D
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  D
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-200 px-4 py-3 text-sm shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={t('chatbot.placeholder')}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={send}
                disabled={typing}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition"
              >
                {t('common.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
