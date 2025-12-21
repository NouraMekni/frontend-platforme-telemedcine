import { useState, useCallback, useEffect } from 'react';

export const useEnhancedChatbotRAG = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [medicalData, setMedicalData] = useState(null);

  // Charger les données médicales
  useEffect(() => {
    const loadMedicalData = async () => {
      try {
        const response = await fetch('/enhanced_medical_knowledge.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMedicalData(data);
        console.log('🏥 Données médicales chargées:', Object.keys(data.specialties).length, 'spécialités');
      } catch (error) {
        console.error('❌ Erreur chargement données médicales:', error);
        // Fallback - essayer import direct
        import('../data/enhanced_medical_knowledge.json').then(module => {
          setMedicalData(module.default || module);
          console.log('🏥 Données médicales chargées via import direct');
        }).catch(importError => {
          console.error('❌ Erreur import fallback:', importError);
        });
      }
    };
    
    loadMedicalData();
  }, []);
  const [conversationContext, setConversationContext] = useState({
    lastSymptoms: [],
    possibleDiseases: [],
    askedQuestions: []
  });

  // Charger les messages depuis localStorage au démarrage
  useEffect(() => {
    const savedMessages = localStorage.getItem('medical_chatbot_messages');
    const savedHistory = localStorage.getItem('medical_chatbot_history');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      }
    }
  }, []);

  // Sauvegarder les messages dans localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('medical_chatbot_messages', JSON.stringify(messages));
      
      // Créer une entrée d'historique si c'est une nouvelle conversation
      const history = JSON.parse(localStorage.getItem('medical_chatbot_history') || '[]');
      const today = new Date().toLocaleDateString('fr-FR');
      const todayEntry = history.find(entry => entry.date === today);
      
      if (!todayEntry && messages.length === 2) { // Nouvelle conversation (question + réponse)
        const firstUserMessage = messages.find(m => m.isUser)?.content || 'Conversation médicale';
        const summary = firstUserMessage.length > 50 ? 
          firstUserMessage.substring(0, 50) + '...' : firstUserMessage;
          
        history.unshift({
          id: Date.now(),
          date: today,
          summary: summary,
          messageCount: messages.length,
          timestamp: new Date().toISOString()
        });
        
        // Garder seulement les 10 dernières entrées d'historique
        if (history.length > 10) {
          history.splice(10);
        }
        
        localStorage.setItem('medical_chatbot_history', JSON.stringify(history));
      }
    }
  }, [messages]);

  // Fonction pour normaliser le texte
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Fonction pour calculer la similarité sémantique améliorée
  const calculateAdvancedSimilarity = (text1, text2) => {
    const normalized1 = normalizeText(text1);
    const normalized2 = normalizeText(text2);
    
    // Similarité exacte
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 1.0;
    }

  const words1 = normalized1.split(" ").filter(w => w.length > 3); // Augmenté de 2 à 3
  const words2 = normalized2.split(" ").filter(w => w.length > 3); // Augmenté de 2 à 3    if (words1.length === 0 || words2.length === 0) return 0;

    let matchScore = 0;
    let totalWords = Math.max(words1.length, words2.length);

    // Correspondances exactes et partielles
    words1.forEach(word1 => {
      words2.forEach(word2 => {
        if (word1 === word2) {
          matchScore += 1;
        } else if (word1.includes(word2) || word2.includes(word1)) {
          matchScore += 0.7;
        } else if (areSynonyms(word1, word2)) {
          matchScore += 0.8;
        }
      });
    });

    // Bonus pour mots-clés médicaux importants - DEBUG VERSION
    const medicalKeywords = ['mal', 'douleur', 'toux', 'poumon', 'thoracique', 'respiratoire'];
    try {
      medicalKeywords.forEach(keyword => {
        if (normalized1.includes(keyword) && normalized2.includes(keyword)) {
          console.log(`🔍 BONUS médical détecté: "${keyword}"`);
          matchScore += 0.1; // Réduit pour debug
        }
      });
    } catch (error) {
      console.error('Erreur dans bonus médical:', error);
    }

    return Math.min(matchScore / totalWords, 1.0);
  };

  // Fonction pour détecter le contexte du patient (âge, etc.)
  const detectPatientContext = (userInput) => {
    const normalizedInput = normalizeText(userInput);
    const context = {
      age: 'adulte',
      keywords: []
    };

    // Détection d'âge pédiatrique avec contexte
    const pediatricKeywords = [
      'enfant', 'bebe', 'nourrisson', 'fils', 'fille', 'bambin', 'gamin', 'gosse', 'mome', 'gamine', 'fillette', 'garcon',
      'garçon', 'fillette', 'bébé', 'nouveau-ne', 'nouveau ne',
      'mon enfant', 'ma fille', 'mon fils', 'mon bebe', 'pediatre', 'pediatrie'
    ];

    pediatricKeywords.forEach(keyword => {
      if (normalizedInput.includes(keyword)) {
        // Éviter les faux positifs avec "petit" dans "petit appétit"
        if (keyword === 'petit' || keyword === 'petite') {
          // Vérifier le contexte - doit être suivi de garçon/fille ou contexte familial
          const regex = new RegExp(`\\b(mon|ma)\\s+${keyword}\\b`, 'i');
          if (regex.test(userInput)) {
            context.age = 'enfant';
            context.keywords.push(keyword);
          }
        } else {
          context.age = 'enfant';
          context.keywords.push(keyword);
        }
      }
    });

    // Détection d'âge senior
    const seniorKeywords = [
      'age', 'senior', 'grand mere', 'grand pere', 'retraite', 'vieux', 'vieille'
    ];

    seniorKeywords.forEach(keyword => {
      if (normalizedInput.includes(keyword)) {
        context.age = 'senior';
        context.keywords.push(keyword);
      }
    });

    return context;
  };

  // Dictionnaire de synonymes médicaux
  const medicalSynonyms = {
    "douleur": ["mal", "souffrance", "gene", "inconfort", "douleur"],
    "fievre": ["temperature", "hyperthermie", "febricule"],
    "fatigue": ["epuisement", "lassitude", "asthenie"],
    "nausee": ["envie_vomir", "mal_coeur", "haut_le_coeur"],
    "toux": ["tousser", "expectoration", "expectorations"],
    "gorge": ["pharynx", "larynx", "amygdales"],
    "ventre": ["abdomen", "estomac", "intestin"],
    "tete": ["crane", "cerveau", "cephalee"],
    "poumon": ["poumons", "thorax", "poitrine", "bronches", "respiratoire"],
    "mal": ["douleur", "souffrance", "gene", "inconfort"],
    "respiration": ["respiratoire", "souffle", "essoufflement"],
    "thoracique": ["thorax", "poitrine", "poumon", "poumons"]
  };

  const areSynonyms = (word1, word2) => {
    for (const [key, synonyms] of Object.entries(medicalSynonyms)) {
      if ((key === word1 || synonyms.includes(word1)) && 
          (key === word2 || synonyms.includes(word2))) {
        return true;
      }
    }
    return false;
  };

  // Détection d'urgence améliorée
  const detectEmergency = (userInput) => {
    const normalizedInput = normalizeText(userInput);
    
    for (const [level, keywords] of Object.entries(medicalData.emergency_keywords)) {
      for (const keyword of keywords) {
        if (normalizedInput.includes(normalizeText(keyword))) {
          return {
            level,
            detected: true,
            keyword: keyword
          };
        }
      }
    }
    return { level: 'none', detected: false };
  };

  // Recherche de maladies améliorée avec score de confiance
  const findMatchingDiseases = (userInput) => {
    const normalizedInput = normalizeText(userInput);
    console.log('📝 Input normalisé:', normalizedInput);
    
    // Détecter les intentions opposées pour le poids AVANT de chercher
    const gainWeightKeywords = ['gagne', 'gagner', 'prendre', 'grossir', 'augmenter', 'prise de poids'];
    const loseWeightKeywords = ['perdre', 'perte', 'maigrir', 'mincir', 'regime'];
    
    const hasGainIntent = gainWeightKeywords.some(keyword => normalizedInput.includes(keyword));
    const hasLoseIntent = loseWeightKeywords.some(keyword => normalizedInput.includes(keyword));
    
    if (normalizedInput.includes('poids')) {
      const nutritionSpecialty = medicalData.specialties.nutrition;
      
      if (hasGainIntent && !hasLoseIntent) {
        console.log('🎯 Intention détectée: PRENDRE du poids');
        const prisePoidsDisease = nutritionSpecialty.diseases.find(d => d.id === 'prise_poids');
        if (prisePoidsDisease) {
          return [{
            ...prisePoidsDisease,
            specialty: nutritionSpecialty.name,
            confidenceScore: 10.0,
            matchDetails: { intentionMatch: true }
          }];
        }
      } else if (hasLoseIntent && !hasGainIntent) {
        console.log('🎯 Intention détectée: PERDRE du poids');
        const pertePoidsDisease = nutritionSpecialty.diseases.find(d => d.id === 'perte_poids');
        if (pertePoidsDisease) {
          return [{
            ...pertePoidsDisease,
            specialty: nutritionSpecialty.name,
            confidenceScore: 10.0,
            matchDetails: { intentionMatch: true }
          }];
        }
      }
    }
    
    // Détecter le contexte patient
    const patientContext = detectPatientContext(userInput);
    const diseaseMatches = [];

    // Mots-clés de recherche directe
    const keywordMatches = {
      toux: ['toux', 'tousse', 'toussé'],
      poumon: ['poumon', 'poumons', 'pulmonaire'],
      thoracique: ['thoracique', 'thorax', 'poitrine'],
      mal: ['mal', 'douleur', 'douloureux'],
      respiratoire: ['respiration', 'respiratoire', 'souffle']
    };

    Object.entries(medicalData.specialties).forEach(([specialtyKey, specialty]) => {
      console.log('🏥 Analyse spécialité:', specialty.name);
      specialty.diseases.forEach(disease => {
        let confidenceScore = 0;
        let matchedSymptoms = [];
        let matchDetails = {
          symptomMatches: 0,
          nameMatch: false,
          descriptionMatch: false,
          directKeywordMatch: false,
          contextBonus: false
        };

        // Bonus pour contexte pédiatrique SEULEMENT si détecté explicitement
        if (patientContext.age === 'enfant' && specialty.name === 'Pédiatrie') {
          confidenceScore += 1.0; // Bonus pour correspondance de spécialité
          matchDetails.contextBonus = true;
          console.log(`👶 Bonus pédiatrique pour: ${disease.name}`);
        }
        
        // Pénalité pour maladies pédiatriques chez les adultes
        if (patientContext.age === 'adulte' && specialty.name === 'Pédiatrie') {
          confidenceScore -= 0.5; // Réduire le score pour les maladies pédiatriques chez adultes
          console.log(`👨 Pénalité adulte pour maladie pédiatrique: ${disease.name}`);
        }

        // 1. Recherche directe par mots-clés (plus fiable)
        let directMatch = false;
        disease.symptoms.forEach(symptom => {
          const symptomNormalized = normalizeText(symptom);
          
          // Recherche directe de mots-clés
          if ((normalizedInput.includes('toux') && symptomNormalized.includes('toux')) ||
              (normalizedInput.includes('mal') && normalizedInput.includes('poumon') && 
               (symptomNormalized.includes('mal au poumon') || 
                symptomNormalized.includes('douleur thoracique') ||
                symptomNormalized.includes('poumon'))) ||
              (normalizedInput.includes('poumon') && symptomNormalized.includes('poumon'))) {
            
            confidenceScore += 3.0; // Score élevé pour correspondance directe
            matchedSymptoms.push(symptom);
            directMatch = true;
            matchDetails.directKeywordMatch = true;
            console.log(`🎯 Correspondance directe: "${symptom}"`);
          }
        });

        // 2. Recherche par similarité (méthode de backup)
        if (!directMatch) {
          disease.symptoms.forEach(symptom => {
            const similarity = calculateAdvancedSimilarity(normalizedInput, symptom);
            if (similarity > 0.4) {
              confidenceScore += similarity * 2;
              matchedSymptoms.push(symptom);
              matchDetails.symptomMatches++;
              console.log(`✅ Symptôme trouvé: "${symptom}" (score: ${similarity.toFixed(2)}) pour ${disease.name}`);
            } else if (similarity > 0) {
              console.log(`🔍 Symptôme testé: "${symptom}" (score: ${similarity.toFixed(3)}) pour ${disease.name} - REJETÉ`);
            }
          });
        }

        // Vérification du nom de la maladie
        const nameMatch = calculateAdvancedSimilarity(normalizedInput, disease.name);
        if (nameMatch > 0.6) {
          confidenceScore += nameMatch * 3;
          matchDetails.nameMatch = true;
          console.log(`✅ Nom maladie trouvé: "${disease.name}" (score: ${nameMatch.toFixed(2)})`);
        }

        // Vérification de la description (avec mots-clés plus stricts)
        const descMatch = calculateAdvancedSimilarity(normalizedInput, disease.description);
        if (descMatch > 0.6) { // Augmenté de 0.3 à 0.6 pour éviter les faux positifs
          confidenceScore += descMatch * 1.5;
          matchDetails.descriptionMatch = true;
          console.log(`📝 Match description: "${disease.description}" (score: ${descMatch.toFixed(3)})`);
        }

        // Bonus pour correspondance multiple de symptômes
        if (matchedSymptoms.length > 1) {
          confidenceScore += matchedSymptoms.length * 0.5;
        }

        if (confidenceScore > 0.5) {
          console.log(`🎯 Maladie candidate: ${disease.name} (score: ${confidenceScore.toFixed(2)}) - Symptômes: ${matchedSymptoms.join(', ')}`);
          diseaseMatches.push({
            ...disease,
            specialty: specialty.name,
            confidenceScore,
            matchedSymptoms,
            matchDetails
          });
        } else if (confidenceScore > 0.1) {
          console.log(`🔍 Maladie testée: ${disease.name} (score: ${confidenceScore.toFixed(3)}) - REJETÉE`);
        }
      });
    });

    const sortedMatches = diseaseMatches
      .filter(disease => {
        // Filtrer COMPLÈTEMENT les maladies pédiatriques pour les adultes
        const isAdultContext = patientContext.age === 'adulte' || patientContext.keywords.length === 0;
        if (isAdultContext && disease.specialty === 'Pédiatrie') {
          console.log(`🚫 Filtrage maladie pédiatrique pour adulte: ${disease.name}`);
          return false; // Éliminer complètement les maladies pédiatriques pour adultes
        }
        return true;
      })
      .sort((a, b) => {
        // Priorité 1: Score de confiance
        if (Math.abs(a.confidenceScore - b.confidenceScore) > 0.5) {
          return b.confidenceScore - a.confidenceScore;
        }
        
        // Priorité 2: Contexte approprié (adulte vs pédiatrique)
        const isAdultContext = patientContext.age === 'adulte' || patientContext.keywords.length === 0;
        if (isAdultContext) {
          // Pour adultes, pénaliser fortement les spécialités pédiatriques
          if (a.specialty === 'Pédiatrie' && b.specialty !== 'Pédiatrie') {
            return 1; // b en premier
          }
          if (b.specialty === 'Pédiatrie' && a.specialty !== 'Pédiatrie') {
            return -1; // a en premier
          }
        }
        
        return b.confidenceScore - a.confidenceScore;
      })
      .slice(0, 3);
    
    console.log('🏆 Top 3 maladies (après tri contexte):', sortedMatches.map(d => `${d.name} (${d.specialty}) - ${d.confidenceScore.toFixed(2)}`));
    return sortedMatches;
  };

  // Génération de questions de suivi intelligentes
  const generateFollowUpQuestions = (diseases, userInput) => {
    const questions = [];
    const normalizedInput = normalizeText(userInput);

    // Questions basées sur les maladies détectées
    if (diseases.length > 0) {
      const topDisease = diseases[0];
      
      // Identifier si c'est une demande de conseil/objectif ou un symptôme médical
      const isHealthGoal = topDisease.id && (
        topDisease.id.includes('perte_poids') || 
        topDisease.id.includes('conseil_nutritionnel') ||
        topDisease.id.includes('prise_poids') ||
        topDisease.specialty === 'Nutrition' && !normalizedInput.includes('fatigue')
      );

      if (isHealthGoal) {
        // Questions pour objectifs de santé/nutrition
        if (topDisease.id === 'perte_poids') {
          questions.push("Quel est votre objectif de perte de poids ?");
          questions.push("Avez-vous des contraintes alimentaires ou préférences particulières ?");
        } else if (topDisease.id === 'conseil_nutritionnel') {
          questions.push("Souhaitez-vous améliorer un aspect particulier de votre alimentation ?");
          questions.push("Avez-vous des objectifs spécifiques (énergie, digestion, poids) ?");
        } else if (topDisease.id === 'prise_poids') {
          questions.push("Quel poids souhaitez-vous atteindre ?");
          questions.push("Avez-vous des difficultés particulières pour prendre du poids ?");
        }
      } else {
        // Questions pour symptômes médicaux traditionnels
        // Questions sur la durée si pas mentionnée
        if (!normalizedInput.includes('depuis') && !normalizedInput.includes('jour') && !normalizedInput.includes('semaine')) {
          questions.push(medicalData.follow_up_questions.duration);
        }

        // Questions sur l'intensité pour les douleurs
        if (normalizedInput.includes('douleur') || normalizedInput.includes('mal')) {
          questions.push(medicalData.follow_up_questions.intensity);
        }

        // Questions spécifiques selon la maladie
        if (topDisease.id === 'migraine' || topDisease.id === 'mal_de_tete') {
          questions.push("La douleur est-elle pulsatile ? S'accompagne-t-elle de nausées ?");
        }

        if (topDisease.specialty === 'Dermatologie') {
          questions.push("Où sont localisées les lésions ? Depuis quand sont-elles apparues ?");
        }
      }
    }

    // Questions générales si aucune maladie trouvée
    if (diseases.length === 0) {
      questions.push(
        "Pouvez-vous décrire plus précisément vos symptômes ?",
        "Y a-t-il des facteurs qui soulagent ou aggravent vos symptômes ?"
      );
    }

    return questions.slice(0, 2); // Limiter à 2 questions
  };

  // Génération de réponse améliorée
  const generateEnhancedResponse = (userInput) => {
    const normalizedInput = normalizeText(userInput);
    let response = "";

    // 0. Détection du contexte patient (nouveau)
    const patientContext = detectPatientContext(userInput);
    console.log('👶 Contexte patient détecté:', patientContext);

    // 1. Vérification d'urgence
    const emergency = detectEmergency(userInput);
    if (emergency.detected) {
      if (emergency.level === 'urgence_immediate') {
        response += "🚨 **URGENCE MÉDICALE** 🚨\n\n";
        response += "Ces symptômes nécessitent une **intervention médicale immédiate**.\n";
        response += "**Appelez le 194 (SAMU) ou rendez-vous aux urgences MAINTENANT.**\n\n";
        response += "Ne retardez pas les soins !\n\n---\n\n";
      } else if (emergency.level === 'urgence_elevee') {
        response += "⚠️ **ATTENTION - SYMPTÔMES PRÉOCCUPANTS** ⚠️\n\n";
        response += "Ces symptômes nécessitent une **consultation médicale rapide**.\n";
        response += "Contactez votre médecin dans les plus brefs délais ou consultez un service d'urgence.\n\n---\n\n";
      }
    }

    // 2. Recherche de maladies correspondantes
    const matchingDiseases = findMatchingDiseases(userInput);
    
    if (matchingDiseases.length > 0) {
      response += "🔍 **Analyse de vos symptômes :**\n\n";
      
      // Afficher SEULEMENT le meilleur diagnostic (pas les secondaires)
      const topDisease = matchingDiseases[0];
      const confidencePercentage = Math.round(topDisease.confidenceScore * 100);
      const confidenceIcon = confidencePercentage > 80 ? "🎯" : confidencePercentage > 60 ? "📊" : "💡";
      
      response += `${confidenceIcon} **${topDisease.name}** (${topDisease.specialty})\n`;
      response += `📋 Correspondance : ${confidencePercentage}%\n`;
      response += `📝 Description : ${topDisease.description}\n`;
      
      if (topDisease.matchedSymptoms.length > 0) {
        response += `✅ Symptômes correspondants : ${topDisease.matchedSymptoms.join(", ")}\n`;
      }
      
      response += `💊 **Traitements possibles :** ${topDisease.treatments.join(", ")}\n`;
      response += `⏱️ Durée habituelle : ${topDisease.duration}\n`;
      response += `🎚️ Gravité : ${topDisease.severity}\n`;
      
      if (topDisease.prevention && topDisease.prevention.length > 0) {
        response += `🛡️ Prévention : ${topDisease.prevention.join(", ")}\n`;
      }
      
      response += "\n👨‍⚕️ **Recommandations :**\n\n";
      
      // Logique intelligente pour choisir la spécialité
      let recommendedSpecialty = topDisease.specialty;
      
      // SEULEMENT si le contexte est explicitement pédiatrique
      if (patientContext.age === 'enfant' && patientContext.keywords.length > 0) {
        const isPediatricDisease = topDisease.specialty === 'Pédiatrie';
        if (isPediatricDisease) {
          response += `Consultez un **pédiatre**\n\n`;
        } else {
          response += `Consultez un **pédiatre** ou médecin généraliste\n\n`;
        }
      } else {
        // Pour adultes ou contexte non spécifié
        response += `Consultez un professionnel en **${recommendedSpecialty}**\n\n`;
      }
      
      if (topDisease.severity === 'grave') {
        response += "**Consultation urgente recommandée**\n";
      } else if (topDisease.severity === 'modéré') {
        response += "Consultation dans les prochains jours\n";
      } else {
        response += "Surveillance, consultation si aggravation\n";
      }
      
      // 4. Questions de suivi (simplifiées)
      const followUpQuestions = generateFollowUpQuestions(matchingDiseases, userInput);
      if (followUpQuestions.length > 0) {
        response += "\n❓ **Questions importantes :**\n";
        
        followUpQuestions.slice(0, 2).forEach((question, index) => { // Limité à 2 questions
          response += `${index + 1}. ${question}\n`;
        });
      }

    } else {
      // Aucune correspondance trouvée (version courte)
      response += "🤔 **Aucun diagnostic évident**\n\n";
      response += "📝 **Précisez :**\n";
      response += "• Localisation exacte des symptômes\n";
      response += "• Durée (depuis quand ?)\n";
      response += "• Intensité (1-10)\n\n";
      response += "🏥 Consultez votre **médecin généraliste** pour un examen.\n";
    }

    // 5. Disclaimer médical complet
    response += "\n" + "═".repeat(50) + "\n";
    response += "⚠️ **IMPORTANT - Avertissement médical**\n\n";
    response += "Cette analyse est **purement informative** et ne remplace en aucun cas :\n";
    response += "• Un diagnostic médical professionnel\n";
    response += "• Une consultation avec un médecin\n";
    response += "• Un traitement médical approprié\n";
    response += "**En cas de doute ou d'aggravation, consultez rapidement un professionnel de santé.**\n";
    response += "📞 Urgences : 194 (SAMU) | 190 (Police) | 198 (Pompiers)";

    return response;
  };

  // Fonction principale pour envoyer un message
  const sendMessage = useCallback(async (userMessage) => {
    // Protection contre les appels multiples simultanés
    if (isLoading) {
      console.log('⏳ Message en cours de traitement, veuillez patienter...');
      return;
    }

    console.log('🔍 Début analyse:', userMessage);
    console.log('📊 Données médicales chargées:', medicalData ? 'OUI' : 'NON');
    
    setIsLoading(true);
    
    try {
      // Vérifier que les données médicales sont chargées
      if (!medicalData) {
        console.warn('⚠️ Données médicales non chargées, attente...');
        const errorMsg = {
          id: Date.now() + Math.random() + 1,
          content: "⚠️ Chargement des données médicales en cours... Veuillez patienter et réessayer dans quelques secondes.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          content: userMessage,
          isUser: true,
          timestamp: new Date()
        }, errorMsg]);
        return;
      }
      
      // Ajouter le message utilisateur
      const userMsg = {
        id: Date.now() + Math.random(),
        content: userMessage,
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMsg]);

      // Générer la réponse améliorée (suppression du délai artificiel)
      console.log('🧠 Génération de la réponse...');
      const botResponse = generateEnhancedResponse(userMessage);
      console.log('✅ Réponse générée:', botResponse.substring(0, 100) + '...');
      
      const botMsg = {
        id: Date.now() + Math.random() + 1,
        content: botResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);

      // Mettre à jour le contexte de conversation
      const matchingDiseases = findMatchingDiseases(userMessage);
      console.log('🏥 Maladies trouvées:', matchingDiseases.length);
      setConversationContext(prev => ({
        ...prev,
        lastSymptoms: [...prev.lastSymptoms, userMessage],
        possibleDiseases: matchingDiseases
      }));

    } catch (error) {
      console.error('❌ Erreur dans sendMessage:', error);
      let errorMessage = "❌ Une erreur s'est produite. Veuillez réessayer.";
      
      // Messages d'erreur plus spécifiques
      if (error.message.includes('fetch')) {
        errorMessage = "🌐 Problème de connexion. Vérifiez votre réseau et réessayez.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "⏱️ Délai d'attente dépassé. Veuillez réessayer.";
      } else if (error.message.includes('memory')) {
        errorMessage = "💾 Mémoire insuffisante. Essayez de rafraîchir la page.";
      }
      
      const errorMsg = {
        id: Date.now() + Math.random(), // ID unique pour éviter les conflits
        content: errorMessage,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      // S'assurer que isLoading est TOUJOURS remis à false
      setIsLoading(false);
      console.log('✅ setIsLoading(false) appelé');
    }

  }, [medicalData]);

  // Fonction pour effacer les messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationContext({
      lastSymptoms: [],
      possibleDiseases: [],
      askedQuestions: []
    });
    localStorage.removeItem('medical_chatbot_messages');
  }, []);

  // Fonction pour obtenir l'historique des conversations
  const getChatHistory = useCallback(() => {
    try {
      const history = localStorage.getItem('medical_chatbot_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      return [];
    }
  }, []);

  // Fonction pour effacer tout l'historique
  const clearChatHistory = useCallback(() => {
    localStorage.removeItem('medical_chatbot_history');
    localStorage.removeItem('medical_chatbot_messages');
    setMessages([]);
    setConversationContext({
      lastSymptoms: [],
      possibleDiseases: [],
      askedQuestions: []
    });
  }, []);

  // Fonction pour obtenir des suggestions de questions
  const getSuggestedQuestions = () => {
    return [
      "J'ai mal à la tête et de la fièvre",
      "Je ressens des douleurs abdominales",
      "J'ai des démangeaisons et des rougeurs sur la peau",
      "Je me sens très fatigué depuis plusieurs jours",
      "J'ai mal à la gorge et j'ai du mal à avaler"
    ];
  };

  return {
    messages,
    sendMessage,
    clearMessages,
    getChatHistory,
    clearChatHistory,
    isLoading,
    conversationContext,
    getSuggestedQuestions
  };
};