'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'

export default function PatientHeader({ user }: { user: any }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/80">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/dashboard/patient" className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <Image src="/logo1.png" alt="DentAssist" width={40} height={40} className="object-contain" />
          </div>
          <span className="text-xl font-bold text-white">DentAssist</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard/patient" 
            className={`transition ${isActive('/dashboard/patient') ? 'text-blue-400 font-medium' : 'text-gray-300 hover:text-white'}`}
          >
            Tableau de bord
          </Link>
          <Link 
            href="/dashboard/patient/appointments" 
            className={`transition ${isActive('/dashboard/patient/appointments') ? 'text-blue-400 font-medium' : 'text-gray-300 hover:text-white'}`}
          >
            Rendez-vous
          </Link>
          <Link 
            href="/dashboard/patient/records" 
            className={`transition ${isActive('/dashboard/patient/records') ? 'text-blue-400 font-medium' : 'text-gray-300 hover:text-white'}`}
          >
            Documents
          </Link>
          <Link 
            href="/dashboard/patient/history" 
            className={`transition ${isActive('/dashboard/patient/history') ? 'text-blue-400 font-medium' : 'text-gray-300 hover:text-white'}`}
          >
            Historique
          </Link>
         
            
           
          <Link 
            href="/dashboard/patient/profile" 
            className={`transition ${isActive('/dashboard/patient/profile') ? 'text-blue-400 font-medium' : 'text-gray-300 hover:text-white'}`}
          >
            Profil
          </Link>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">{user?.fullName}</span>
        
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition text-sm">
            Déconnexion
          </button>
        </div>
      </nav>
    </header>
  )
}

