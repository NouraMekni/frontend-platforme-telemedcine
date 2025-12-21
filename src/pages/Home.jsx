import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

function FeatureCard({ title, children }){
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{children}</p>
    </div>
  )
}

export default function Home(){
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-50 to-white py-20">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary-700 mb-4">Plateforme de Télémédecine & Suivi de Santé Intelligent</h1>
              <p className="text-slate-700 mb-6">Téléconsultation, suivi de vos constantes et aide prédictive par IA — tout au même endroit.</p>
              <div className="flex gap-3">
                <button onClick={()=>navigate('/login')} className="bg-primary-500 text-white px-5 py-3 rounded">Commencer maintenant</button>
                <button onClick={()=>navigate('/register')} className="px-5 py-3 rounded border">Créer un compte</button>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white p-8 rounded-lg shadow"> 
                <div className="text-center text-primary-600 text-5xl">🩺</div>
                <p className="mt-4 text-slate-600">Interface moderne pour patients et médecins.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6">Pourquoi nous choisir ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard title="Téléconsultation">Prise de rendez-vous et consultations vidéo sécurisées.</FeatureCard>
              <FeatureCard title="Suivi santé">Enregistrement et visualisation des constantes vitales.</FeatureCard>
              <FeatureCard title="IA prédictive">Outils d'aide à la décision pour anticiper les risques.</FeatureCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
