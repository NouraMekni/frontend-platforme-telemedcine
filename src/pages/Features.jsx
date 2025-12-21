import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const features = [
  {
    icon: '🩺',
    title: 'Téléconsultation Vidéo',
    description: 'Consultations médicales à distance sécurisées avec vos médecins préférés',
    details: [
      'Vidéo HD avec qualité médicale',
      'Partage de documents en temps réel',
      'Enregistrement automatique des consultations',
      'Support multi-appareils'
    ]
  },
  {
    icon: '📋',
    title: 'Dossier Médical Numérique',
    description: 'Accès centralisé à votre historique médical complet',
    details: [
      'Historique des consultations',
      'Ordonnances électroniques',
      'Résultats d\'analyses',
      'Carnet de vaccination numérique'
    ]
  },
  {
    icon: '📊',
    title: 'Suivi de Santé Intelligent',
    description: 'Monitoring automatique de vos constantes vitales avec alertes',
    details: [
      'Graphiques de tendances',
      'Alertes personnalisées',
      'Objectifs de santé',
      'Rappels de mesures'
    ]
  },
  {
    icon: '🤖',
    title: 'IA Prédictive',
    description: 'Intelligence artificielle pour anticiper les risques de santé',
    details: [
      'Analyse prédictive des risques',
      'Recommandations personnalisées',
      'Détection d\'anomalies',
      'Aide à la décision médicale'
    ]
  },
  {
    icon: '💊',
    title: 'Gestion des Médicaments',
    description: 'Suivi complet de vos traitements et ordonnances',
    details: [
      'Rappels de prise',
      'Interactions médicamenteuses',
      'Localisation de pharmacies',
      'Renouvellement automatique'
    ]
  },
  {
    icon: '📱',
    title: 'Application Mobile',
    description: 'Accès mobile complet à tous vos services de santé',
    details: [
      'Disponible iOS et Android',
      'Synchronisation temps réel',
      'Mode hors ligne',
      'Notifications push'
    ]
  }
]

const specialties = [
  'Médecine générale', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 
  'Nutrition', 'Allergologie', 'Dentiste', 'ORL', 'Ophtalmologie', 'Psychiatrie'
]

export default function Features(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-primary-700 mb-4">
              Fonctionnalités de notre Plateforme
            </h1>
            <p className="text-lg text-slate-700 mb-8 max-w-3xl mx-auto">
              Découvrez l'ensemble des outils et services qui révolutionnent votre expérience de santé
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="card hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-slate-500 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialties Section */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Spécialités Médicales Disponibles</h2>
              <p className="text-slate-600">
                Accédez à un large réseau de spécialistes qualifiés
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {specialties.map((specialty, index) => (
                <div key={index} className="bg-white p-4 rounded-lg text-center hover:bg-primary-50 transition-colors">
                  <div className="font-medium text-slate-700">{specialty}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Technologie de Pointe</h2>
              <p className="text-slate-600">
                Sécurité, performance et innovation au service de votre santé
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="font-semibold mb-2">Sécurité Renforcée</h3>
                <p className="text-sm text-slate-600">
                  Chiffrement bout-en-bout, conformité RGPD, hébergement sécurisé
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2">Performance Optimale</h3>
                <p className="text-sm text-slate-600">
                  Infrastructure cloud, temps de réponse rapide, disponibilité 99.9%
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🔄</div>
                <h3 className="font-semibold mb-2">Synchronisation Temps Réel</h3>
                <p className="text-sm text-slate-600">
                  Données synchronisées instantanément sur tous vos appareils
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à Révolutionner Votre Santé ?
            </h2>
            <p className="text-lg mb-8 text-primary-100">
              Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50">
                Commencer Gratuitement
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg hover:bg-primary-500">
                Demander une Démo
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}