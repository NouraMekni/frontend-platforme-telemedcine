import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const plans = [
  {
    name: 'Essentiel',
    price: 'Gratuit',
    period: '',
    description: 'Parfait pour commencer votre suivi de santé',
    features: [
      '3 consultations par mois',
      'Dossier médical de base',
      'Rappels de médicaments',
      'Support par email',
      'Application mobile'
    ],
    notIncluded: [
      'IA prédictive',
      'Consultations illimitées',
      'Support prioritaire'
    ],
    popular: false,
    color: 'border-slate-200'
  },
  {
    name: 'Premium',
    price: '95 DT',
    period: '/mois',
    description: 'Le choix idéal pour un suivi complet',
    features: [
      'Consultations illimitées',
      'Dossier médical complet',
      'IA prédictive avancée',
      'Analyses de tendances',
      'Support prioritaire 24/7',
      'Rappels intelligents',
      'Partage familial (4 profils)'
    ],
    notIncluded: [
      'Consultation à domicile',
      'Bilan de santé annuel'
    ],
    popular: true,
    color: 'border-primary-500'
  },
  {
    name: 'Famille',
    price: '160 DT',
    period: '/mois',
    description: 'Santé de toute la famille en un seul abonnement',
    features: [
      'Tout du plan Premium',
      'Jusqu\'à 8 profils famille',
      'Suivi pédiatrique spécialisé',
      'Consultation à domicile (2/mois)',
      'Bilan de santé annuel',
      'Télémédecine d\'urgence',
      'Coach santé dédié'
    ],
    notIncluded: [],
    popular: false,
    color: 'border-orange-400'
  }
]

const consultationPrices = [
  { specialty: 'Médecine générale', price: '80 DT', duration: '30 min' },
  { specialty: 'Pédiatrie', price: '115 DT', duration: '30 min' },
  { specialty: 'Gynécologie', price: '180 DT', duration: '30 min' },
  { specialty: 'Dermatologie', price: '150 DT', duration: '30 min' },
  { specialty: 'Nutrition', price: '130 DT', duration: '45 min' },
  { specialty: 'Allergologie', price: '165 DT', duration: '30 min' },
  { specialty: 'Dentiste', price: '200 DT', duration: '30 min' },
  { specialty: 'ORL', price: '180 DT', duration: '30 min' },
  { specialty: 'Ophtalmologie', price: '165 DT', duration: '30 min' },
  { specialty: 'Psychiatrie', price: '260 DT', duration: '60 min' },
]

export default function Pricing(){
  const [billingPeriod, setBillingPeriod] = useState('monthly')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-primary-700 mb-4">
              Tarifs Transparents et Accessibles
            </h1>
            <p className="text-lg text-slate-700 mb-8 max-w-3xl mx-auto">
              Choisissez le plan qui correspond à vos besoins de santé. 
              Pas de frais cachés, résiliez à tout moment.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={billingPeriod === 'monthly' ? 'font-medium' : 'text-slate-500'}>
                Mensuel
              </span>
              <button 
                className="relative w-12 h-6 bg-slate-200 rounded-full transition-colors"
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
              <span className={billingPeriod === 'annual' ? 'font-medium' : 'text-slate-500'}>
                Annuel
                <span className="ml-1 text-green-600 text-sm">(-20%)</span>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div key={index} className={`card relative ${plan.color} ${plan.popular ? 'border-2' : 'border'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm">
                        Le plus populaire
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-slate-500">
                          {billingPeriod === 'annual' ? '/an' : plan.period}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'annual' && plan.price !== 'Gratuit' && (
                      <div className="text-sm text-green-600">
                        Économisez {plan.name === 'Premium' ? '70€' : '118€'} par an
                      </div>
                    )}
                    <p className="text-sm text-slate-600">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <span className="text-green-500 mr-3">✓</span>
                        {feature}
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-400">
                        <span className="text-slate-300 mr-3">✗</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular 
                      ? 'bg-primary-500 text-white hover:bg-primary-600' 
                      : 'border border-primary-500 text-primary-500 hover:bg-primary-50'
                  }`}>
                    {plan.price === 'Gratuit' ? 'Commencer Gratuitement' : 'Choisir ce Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Consultation Prices */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Tarifs des Consultations à l'Unité</h2>
              <p className="text-slate-600">
                Payez uniquement ce que vous consommez, sans engagement
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {consultationPrices.map((consultation, index) => (
                <div key={index} className="bg-white p-6 rounded-lg text-center">
                  <h3 className="font-medium mb-2">{consultation.specialty}</h3>
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {consultation.price}
                  </div>
                  <div className="text-sm text-slate-500">{consultation.duration}</div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-slate-600 mb-4">
                * Tarifs sans abonnement. Réductions automatiques avec les plans Premium et Famille.
              </p>
              <button className="bg-primary-500 text-white px-6 py-3 rounded-lg">
                Prendre Rendez-vous
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Les consultations sont-elles remboursées ?</h3>
                <p className="text-slate-600">
                  Oui, nos consultations sont remboursées par la Sécurité Sociale et la plupart des mutuelles. 
                  Le taux de remboursement dépend de votre couverture.
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
                <p className="text-slate-600">
                  Absolument ! Vous pouvez modifier ou annuler votre abonnement à tout moment depuis votre espace personnel.
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Y a-t-il une période d'essai gratuite ?</h3>
                <p className="text-slate-600">
                  Oui, nous offrons 14 jours d'essai gratuit sur tous nos plans premium, sans engagement.
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Comment fonctionne le partage familial ?</h3>
                <p className="text-slate-600">
                  Le plan Famille permet de créer jusqu'à 8 profils distincts avec des dossiers médicaux séparés, 
                  tous gérés depuis un seul compte principal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Une Question sur nos Tarifs ?
            </h2>
            <p className="text-lg mb-8 text-primary-100">
              Notre équipe est là pour vous aider à choisir le plan parfait
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium">
                Contacter un Conseiller
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg hover:bg-primary-500">
                Documentation Complète
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}