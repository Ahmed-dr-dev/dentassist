
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })

  useEffect(() => {
    // Check if already logged in
    checkIfLoggedIn()
  }, [])

  const checkIfLoggedIn = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        // User is already logged in, redirect to home
        router.push('/')
      }
    } catch (error) {
      // User not logged in, stay on signup page
    }
  }

  const validateEmail = (email: string): string => {
    if (!email) return 'L\'email est requis'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Format d\'email invalide'
    return ''
  }

  const validateName = (name: string, fieldName: string): string => {
    if (!name) return `${fieldName} est requis`
    if (name.length < 2) return `${fieldName} doit contenir au moins 2 caractères`
    if (/[0-9]/.test(name)) return `${fieldName} ne peut pas contenir de chiffres`
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) return `${fieldName} contient des caractères invalides`
    return ''
  }

  const validatePhone = (phone: string): string => {
    if (!phone) return 'Le numéro de téléphone est requis'
    // Remove spaces and dashes for validation
    const cleanPhone = phone.replace(/[\s-]/g, '')
    // Check for international format (+216XXXXXXXX or +XXXXXXXXXX) or local format
    const phoneRegex = /^(\+?\d{1,3}[\s-]?)?\d{8,15}$/
    if (!phoneRegex.test(cleanPhone)) return 'Format de téléphone invalide (ex: +21612345678)'
    return ''
  }

  const validatePassword = (password: string): string => {
    if (!password) return 'Le mot de passe est requis'
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères'
    return ''
  }

  const validateConfirmPassword = (confirmPassword: string, password: string): string => {
    if (!confirmPassword) return t('auth.confirmPasswordRequired')
    if (confirmPassword !== password) return t('auth.passwordMismatch')
    return ''
  }

  const validateField = (field: string, value: string) => {
    let error = ''
    switch (field) {
      case 'email':
        error = validateEmail(value)
        break
      case 'firstName':
        error = validateName(value, 'Le prénom')
        break
      case 'lastName':
        error = validateName(value, 'Le nom')
        break
      case 'phone':
        error = validatePhone(value)
        break
      case 'password':
        error = validatePassword(value)
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value)
          setFieldErrors(prev => ({ ...prev, [field]: error, confirmPassword: confirmError }))
        } else {
          setFieldErrors(prev => ({ ...prev, [field]: error }))
        }
        break
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password)
        break
    }
    if (field !== 'password') setFieldErrors(prev => ({ ...prev, [field]: error }))
    return error === ''
  }

  const validateForm = (): boolean => {
    const errors = {
      email: validateEmail(formData.email),
      firstName: validateName(formData.firstName, 'Le prénom'),
      lastName: validateName(formData.lastName, 'Le nom'),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
    }
    setFieldErrors(errors)
    return Object.values(errors).every(error => error === '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          phone: formData.phone.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      // Redirect to login page after successful signup
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="relative w-12 h-12">
              <Image 
                src="/logo1.png" 
                alt="DentAssist Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">DentAssist</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Bienvenue sur DentAssist</h2>
            <p className="text-gray-400">Créez votre compte - C'est gratuit</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nom@gmail.com"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (fieldErrors.email) validateField('email', e.target.value)
                }}
                onBlur={(e) => validateField('email', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500 ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Full Name */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Nom"
                  required
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value })
                    if (fieldErrors.lastName) validateField('lastName', e.target.value)
                  }}
                  onBlur={(e) => validateField('lastName', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500 ${
                    fieldErrors.lastName ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.lastName}</p>
                )}
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Prénom"
                  required
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value })
                    if (fieldErrors.firstName) validateField('firstName', e.target.value)
                  }}
                  onBlur={(e) => validateField('firstName', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500 ${
                    fieldErrors.firstName ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.firstName}</p>
                )}
              </div>
             
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+21612345678"
                required
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  if (fieldErrors.phone) validateField('phone', e.target.value)
                }}
                onBlur={(e) => validateField('phone', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500 ${
                  fieldErrors.phone ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (fieldErrors.password) validateField('password', e.target.value)
                }}
                onBlur={(e) => validateField('password', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500 ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {fieldErrors.password ? (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-400">Minimum 6 caractères</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  if (fieldErrors.confirmPassword) validateField('confirmPassword', e.target.value)
                }}
                onBlur={(e) => validateField('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-500 ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition font-medium text-lg shadow-lg hover:shadow-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription...' : 'Continuer'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400">Ou</span>
            </div>
          </div>

        

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Se connecter
            </Link>
          </p>

          {/* Language Selector */}
          <div className="mt-6 flex justify-center">
            <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
              <option>🇫🇷 Français</option>
              <option>🇬🇧 English</option>
              <option>🇸🇦 العربية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-800 via-gray-900 to-black items-center justify-center p-12 relative overflow-hidden">
        {/* Animated Background Circles */}
        
        <div className="relative z-10 text-center">
          {/* Illustration Placeholder */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              {/* Dashboard Card Illustration */}
          <Image src="/ChatGPT Image Jan 3, 2026, 05_24_31 PM.png" alt="DentAssist Hero" width={500} height={500} className="object-contain" />
              
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            Gérez vos rendez-vous facilement
          </h2>
          <p className="text-xl text-gray-400">
            Plateforme complète pour la gestion de votre cabinet dentaire
          </p>
        </div>
      </div>
    </div>
  )
}

