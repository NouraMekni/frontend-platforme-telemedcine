# 🤖 Assistant Médical IA - Chatbot RAG Amélioré

## 📋 Vue d'ensemble

Un chatbot médical intelligent utilisant la technologie RAG (Retrieval-Augmented Generation) pour analyser les symptômes des patients et fournir des informations médicales pertinentes.

## ✨ Fonctionnalités principales

### 🧠 Intelligence artificielle avancée
- **Analyse sémantique** des symptômes avec similarité textuelle
- **Reconnaissance de synonymes** médicaux (douleur = mal, fièvre = température)
- **Scoring de confiance** pour les correspondances de maladies
- **Détection automatique d'urgence** avec alertes appropriées

### 🏥 Base de connaissances médicales complète
- **10 spécialités médicales** : Médecine générale, Pédiatrie, Gynécologie, Dermatologie, Nutrition, Allergologie, Dentiste, ORL, Ophtalmologie, Psychiatrie
- **+30 maladies** avec symptômes, traitements et préventions
- **Mapping des symptômes** vers les pathologies correspondantes
- **Questions de suivi intelligentes** pour affiner le diagnostic

### 💬 Interface utilisateur moderne
- **Design responsive** adapté mobile et desktop
- **Messages formatés** avec Markdown et alertes colorées
- **Persistance des conversations** via localStorage
- **Suggestions de questions** pour guider l'utilisateur
- **Animations fluides** et feedback visuel

### 🚨 Sécurité médicale
- **Détection d'urgence** automatique avec 3 niveaux d'alerte
- **Disclaimers médicaux** systématiques
- **Orientation vers spécialistes** appropriés
- **Évaluation de gravité** pour chaque pathologie

## 🏗️ Architecture technique

### Structure des fichiers
```
src/
├── components/chatbot/
│   ├── EnhancedMedicalChatbot.jsx    # Composant principal
│   ├── EnhancedChatWindow.jsx        # Interface de chat
│   ├── EnhancedChatMessage.jsx       # Messages formatés
│   ├── EnhancedChatbotButton.jsx     # Bouton flottant
│   └── index.js                      # Exports
├── hooks/
│   └── useEnhancedChatbotRAG.js      # Logique RAG
├── data/
│   └── enhanced_medical_knowledge.json # Base de données médicale
└── index.css                         # Styles personnalisés
```

### Technologies utilisées
- **React 18.2.0** avec hooks modernes
- **TailwindCSS 3.4.7** pour le styling
- **Lucide React** pour les icônes
- **LocalStorage** pour la persistance
- **JSON** pour la base de connaissances

## 🎯 Utilisation

### Intégration dans l'application
```jsx
import EnhancedMedicalChatbot from './components/chatbot/EnhancedMedicalChatbot';

function App() {
  return (
    <div>
      {/* Votre application */}
      <EnhancedMedicalChatbot />
    </div>
  );
}
```

### Options de configuration
```jsx
<EnhancedMedicalChatbot 
  isVisible={true}                    // Afficher/masquer le chatbot
  position="bottom-right"             // Position : bottom-right, bottom-left, top-right, top-left
  theme="primary"                     // Thème de couleur
/>
```

## 📊 Algorithme RAG

### 1. Normalisation du texte
- Suppression des accents et caractères spéciaux
- Conversion en minuscules
- Tokenisation des mots

### 2. Calcul de similarité
- **Correspondance exacte** : score 1.0
- **Correspondance partielle** : score 0.7
- **Synonymes médicaux** : score 0.8
- **Bonus multi-symptômes** : score additionnel

### 3. Scoring de confiance
```javascript
Score final = (Symptômes × 2) + (Nom maladie × 3) + (Description × 1.5) + Bonus
```

### 4. Génération de réponse
- **Pathologies triées** par score de confiance
- **Informations structurées** : description, traitements, prévention
- **Questions de suivi** contextuelles
- **Recommandations spécialisées**

## 🔧 Personnalisation

### Ajouter une nouvelle maladie
```json
{
  "id": "nouvelle_maladie",
  "name": "Nom de la maladie",
  "symptoms": ["symptome1", "symptome2"],
  "description": "Description médicale",
  "treatments": ["traitement1", "traitement2"],
  "severity": "léger|modéré|grave",
  "duration": "durée",
  "prevention": ["prevention1"]
}
```

### Ajouter une spécialité
```json
"nouvelle_specialite": {
  "name": "Nom de la spécialité",
  "description": "Description",
  "diseases": [/* tableau de maladies */]
}
```

## 🚀 Exemples d'interactions

### Symptômes simples
**Utilisateur :** "J'ai mal à la tête et de la fièvre"
**IA :** Analyse → Détecte grippe (85%) → Recommande médecine générale → Pose questions de suivi

### Urgence détectée
**Utilisateur :** "J'ai des difficultés à respirer"
**IA :** 🚨 **URGENCE MÉDICALE** → Recommande appel 15/SAMU → Fournit infos d'urgence

### Spécialité spécifique
**Utilisateur :** "J'ai des démangeaisons et des rougeurs sur la peau"
**IA :** Analyse → Détecte eczéma (78%) → Recommande dermatologue → Suggère traitements

## ⚠️ Avertissements médicaux

- **Ne remplace pas** un diagnostic médical professionnel
- **Informations à titre indicatif** uniquement
- **Consultation médicale** recommandée pour tout problème de santé
- **Urgences** : composer le 15 (SAMU) ou 112

## 🔄 Mises à jour futures

- [ ] Intégration API médicale externe
- [ ] Machine Learning pour améliorer les suggestions
- [ ] Support multilingue
- [ ] Historique médical personnel
- [ ] Intégration avec dossiers patients
- [ ] Notifications de rappel consultations

---

**Version :** 2.0.0  
**Dernière mise à jour :** Octobre 2025  
**Compatibilité :** React 16.8+ (hooks requis)