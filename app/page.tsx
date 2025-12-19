import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="fixed w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">DentAssist</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition">Fonctionnalités</a>
            <a href="#ai" className="text-gray-300 hover:text-white transition">IA</a>
            <a href="#services" className="text-gray-300 hover:text-white transition">Services</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition">Contact</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-300 hover:text-white transition">
              Connexion
            </Link>
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition">
              Inscription
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Plateforme Intelligente avec IA
              </div>
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                Gestion Intelligente de Votre Cabinet Dentaire
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Optimisez votre pratique avec l'IA : gestion des patients, rendez-vous intelligents, 
                assistance vocale et support multilingue.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-500 transition font-medium text-lg">
                  Commencer Maintenant
                </Link>
                <button className="border-2 border-gray-600 text-gray-200 px-8 py-4 rounded-lg hover:border-gray-500 transition font-medium text-lg">
                  Voir la Démo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-xl">
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Prochain Rendez-vous</p>
                      <p className="font-semibold text-white">Aujourd'hui, 14:30</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Patient</span>
                      <span className="font-medium text-gray-200">Ahmed Benali</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Type</span>
                      <span className="font-medium text-gray-200">Détartrage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Fonctionnalités Principales</h2>
            <p className="text-xl text-gray-300">Tout ce dont vous avez besoin pour gérer votre cabinet</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: "Gestion des Patients",
                description: "Profils complets, historique médical, ordonnances et facturation centralisés"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Rendez-vous en Ligne",
                description: "Calendrier dynamique avec confirmation instantanée et rappels automatiques"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Dossiers Médicaux",
                description: "Accès sécurisé aux historiques, traitements et documents médicaux"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Facturation",
                description: "Génération automatique de factures et suivi des paiements"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: "Notifications Intelligentes",
                description: "Rappels automatiques et recommandations personnalisées"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Statistiques & Rapports",
                description: "Tableaux de bord avec insights sur votre activité"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-700 p-6 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-600 transition border border-gray-600">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Intelligence Artificielle</h2>
            <p className="text-xl text-gray-300">Des algorithmes intelligents pour optimiser votre pratique</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[
                {
                  title: "Optimisation des Rendez-vous",
                  description: "L'IA analyse la durée des soins, les retards et propose les meilleurs créneaux horaires automatiquement"
                },
                {
                  title: "Détection d'Incohérences",
                  description: "Identification automatique des anomalies dans les dossiers médicaux et alertes en temps réel"
                },
                {
                  title: "Recommandations Personnalisées",
                  description: "Suggestions de traitements et rappels pour soins périodiques basés sur l'historique patient"
                },
                {
                  title: "Prédiction de Charge",
                  description: "Anticipation des journées chargées et suggestions de réorganisation du planning"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 border border-gray-600">
              <div className="bg-gray-700 rounded-xl p-6 shadow-lg mb-4 border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-300">Efficacité du Planning</span>
                  <span className="text-2xl font-bold text-green-400">+42%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-600">
                <h4 className="font-semibold text-white mb-4">Recommandations IA</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">3 patients nécessitent un rappel détartrage</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-yellow-400">⚠</span>
                    <span className="text-gray-300">Jeudi surchargé : +2h prévues</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-blue-400">ℹ</span>
                    <span className="text-gray-300">Créneaux optimaux : 9h-11h disponibles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Services Section */}
      <section id="services" className="py-20 bg-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Services Avancés</h2>
            <p className="text-xl text-gray-300">Une expérience unique et accessible pour tous</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-8 rounded-xl shadow-sm text-center border border-gray-600 hover:bg-gray-600 transition">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Assistance Vocale</h3>
              <p className="text-gray-300">Navigation et prise de rendez-vous par commande vocale interactive</p>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-xl shadow-sm text-center border border-gray-600 hover:bg-gray-600 transition">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Support Multilingue</h3>
              <p className="text-gray-300">Interface disponible en français, anglais, arabe et plus encore</p>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-xl shadow-sm text-center border border-gray-600 hover:bg-gray-600 transition">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Redirection Intelligente</h3>
              <p className="text-gray-300">Proposition automatique du dentiste disponible le plus proche</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à Transformer Votre Cabinet ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Rejoignez les centaines de dentistes qui ont déjà optimisé leur pratique avec DentAssist
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-500 transition font-medium text-lg">
              Créer un Compte Gratuit
            </Link>
            <button className="border-2 border-gray-600 text-gray-200 px-8 py-4 rounded-lg hover:border-gray-500 transition font-medium text-lg">
              Planifier une Démo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">DentAssist</span>
              </div>
              <p className="text-gray-400 text-sm">
                Plateforme intelligente de gestion de cabinet dentaire
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition">Démo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">À propos</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">RGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 DentAssist. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
