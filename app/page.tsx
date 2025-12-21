import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/80">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-12 h-12 group-hover:scale-110 transition-transform">
              <Image 
                src="/logo1.png" 
                alt="DentAssist Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">DentAssist</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <a href="#home" className="text-gray-300 hover:text-white transition-colors">Accueil</a>
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Connexion</Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all hover:shadow-lg hover:shadow-blue-600/50">
              S'inscrire
            </Link>
            <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-750 transition">
              <option>🇫🇷 FR</option>
              <option>🇬🇧 EN</option>
              <option>🇸🇦 AR</option>
            </select>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm font-medium">Plateforme Dentaire Intelligente</span>
              </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Réservez votre rendez-vous
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                dentaire facilement
              </span>
              </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Gérez vos rendez-vous et visites en une seule plateforme simple. Profitez d'une réservation de soins dentaires sans tracas avec des confirmations instantanées.
            </p>
            
              <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-lg font-medium overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-600/50 hover:scale-105">
                <span className="relative z-10">Prendre rendez-vous</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link href="/login" className="px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-lg text-lg font-medium hover:border-blue-500 hover:text-white transition-all hover:shadow-lg">
                Connexion
                </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-400">Patients satisfaits</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-gray-400">Dentistes experts</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-sm text-gray-400">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative lg:h-[500px] flex items-center justify-center">
            <div className="relative">
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 backdrop-blur-sm hover:scale-105 transition-transform duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Prochain rendez-vous</div>
                      <div className="text-xl font-bold text-white">Aujourd'hui, 14:30</div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Patient</span>
                      <span className="text-white font-medium">Ahmed Benali</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Service</span>
                      <span className="text-blue-400 font-medium">Détartrage</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Statut</span>
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-medium">Confirmé</span>
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                    Voir les détails
                  </button>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce">
                ✓ Confirmé
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
                🔔 Rappel configuré
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Comment ça marche</h2>
            <p className="text-xl text-gray-400">Trois étapes simples pour votre sourire parfait</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
            
            {[
              {
                step: 1,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: "Créez un compte",
                description: "Inscrivez-vous rapidement avec vos informations de base et commencez en quelques minutes"
              },
              {
                step: 2,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Choisissez dentiste et horaire",
                description: "Sélectionnez parmi les créneaux disponibles qui correspondent parfaitement à votre emploi du temps"
              },
              {
                step: 3,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Confirmez le rendez-vous",
                description: "Recevez une confirmation instantanée et des rappels automatiques"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-600/20 hover:-translate-y-2 duration-300">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <div className="text-white">{item.icon}</div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Nos services</h2>
            <p className="text-xl text-gray-400">Soins dentaires complets pour vos besoins</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Consultation",
                description: "Examen dentaire général et conseils d'experts",
                color: "from-blue-600 to-blue-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ),
                title: "Détartrage",
                description: "Nettoyage et polissage professionnels",
                color: "from-green-600 to-green-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ),
                title: "Extraction",
                description: "Extraction dentaire sûre si nécessaire",
                color: "from-orange-600 to-orange-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                title: "Blanchiment",
                description: "Éclaircissez votre sourire professionnellement",
                color: "from-purple-600 to-purple-500"
              }
            ].map((service, idx) => (
              <div key={idx} className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl shadow-lg mb-6 text-white group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative z-10 py-24 bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Pourquoi choisir DentAssist</h2>
            <p className="text-xl text-gray-400">Découvrez l'avenir des soins dentaires</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Réservation facile",
                description: "Réservez des rendez-vous en quelques clics avec notre interface intuitive",
                gradient: "from-yellow-600 to-orange-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: "Rappels intelligents",
                description: "Ne manquez jamais un rendez-vous avec des notifications et rappels automatiques",
                gradient: "from-blue-600 to-purple-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Dossiers sécurisés",
                description: "Vos données médicales sont cryptées et protégées avec une sécurité de niveau entreprise",
                gradient: "from-green-600 to-emerald-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 text-center hover:border-gray-600 transition-all">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg mb-6 text-white group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-sm border-t border-gray-700/50 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <Image 
                  src="/logo1.png" 
                  alt="DentAssist Logo" 
                  width={48} 
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold">DentAssist</span>
            </div>
            
            <p className="text-sm text-gray-400">© 2025 DentAssist. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
