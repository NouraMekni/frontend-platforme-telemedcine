import { useState, useCallback } from 'react';
import medicalKnowledge from '../data/medicalKnowledge.json';

export const useChatbotRAG = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour normaliser le texte (enlever accents, minuscules)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Fonction pour calculer la similarité entre deux textes
  const calculateSimilarity = (text1, text2) => {
    const words1 = normalizeText(text1).split(" ");
    const words2 = normalizeText(text2).split(" ");
    
    let commonWords = 0;
    words1.forEach(word => {
      if (words2.includes(word) && word.length > 2) {
        commonWords++;
      }
    });
    
    return commonWords / Math.max(words1.length, words2.length);
  };

  // Fonction pour rechercher des maladies basées sur les symptômes
  const findRelevantDiseases = (userInput) => {
    const normalizedInput = normalizeText(userInput);
    const relevantDiseases = [];

    medicalKnowledge.diseases.forEach(disease => {
      let score = 0;
      
      // Vérifier les symptômes
      disease.symptoms.forEach(symptom => {
        const similarity = calculateSimilarity(normalizedInput, symptom);
        if (similarity > 0.3) {
          score += similarity * 2;
        }
      });

      // Vérifier le nom de la maladie
      const nameMatch = calculateSimilarity(normalizedInput, disease.name);
      if (nameMatch > 0.4) {
        score += nameMatch * 3;
      }

      // Vérifier la description
      const descMatch = calculateSimilarity(normalizedInput, disease.description);
      if (descMatch > 0.2) {
        score += descMatch;
      }

      if (score > 0.3) {
        relevantDiseases.push({ ...disease, score });
      }
    });

    return relevantDiseases.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  // Fonction pour rechercher des médicaments
  const findRelevantMedications = (userInput) => {
    const normalizedInput = normalizeText(userInput);
    const relevantMeds = [];

    medicalKnowledge.medications.forEach(med => {
      let score = 0;
      
      med.indications.forEach(indication => {
        const similarity = calculateSimilarity(normalizedInput, indication);
        if (similarity > 0.3) {
          score += similarity;
        }
      });

      const nameMatch = calculateSimilarity(normalizedInput, med.name);
      if (nameMatch > 0.4) {
        score += nameMatch * 2;
      }

      if (score > 0.3) {
        relevantMeds.push({ ...med, score });
      }
    });

    return relevantMeds.sort((a, b) => b.score - a.score).slice(0, 2);
  };

  // Fonction pour générer une réponse
  const generateResponse = (userInput) => {
    const normalizedInput = normalizeText(userInput);
    
    // Mots-clés pour différents types de questions
    const medicationKeywords = ["medicament", "traitement", "remede", "pilule", "comprime"];
    const urgencyKeywords = ["urgent", "grave", "douleur forte", "fievre elevee", "difficulte respirer"];
    const preventionKeywords = ["prevention", "eviter", "proteger", "precaution"];

    let response = "";

    // Vérifier l'urgence
    const hasUrgencyKeywords = urgencyKeywords.some(keyword => 
      normalizedInput.includes(keyword.replace(/\s/g, ""))
    );

    if (hasUrgencyKeywords) {
      response += "⚠️ **ATTENTION** : Si vous ressentez des symptômes graves ou urgents, consultez immédiatement un médecin ou appelez les urgences (194).\n\n";
    }

    // Chercher des maladies pertinentes
    const relevantDiseases = findRelevantDiseases(userInput);
    
    if (relevantDiseases.length > 0) {
      response += "📋 **Pathologies possibles basées sur vos symptômes :**\n\n";
      
      relevantDiseases.forEach((disease, index) => {
        response += `${index + 1}. **${disease.name}** (${disease.specialty})\n`;
        response += `   • Description : ${disease.description}\n`;
        response += `   • Symptômes : ${disease.symptoms.join(", ")}\n`;
        response += `   • Traitement : ${disease.treatment.join(", ")}\n`;
        if (disease.prevention.length > 0) {
          response += `   • Prévention : ${disease.prevention.join(", ")}\n`;
        }
        response += `   • Gravité : ${disease.severity}\n\n`;
      });
    }

    // Chercher des médicaments si pertinent
    const hasMedicationQuery = medicationKeywords.some(keyword => 
      normalizedInput.includes(keyword)
    );

    if (hasMedicationQuery || relevantDiseases.length === 0) {
      const relevantMeds = findRelevantMedications(userInput);
      
      if (relevantMeds.length > 0) {
        response += "💊 **Médicaments pouvant être pertinents :**\n\n";
        
        relevantMeds.forEach((med, index) => {
          response += `${index + 1}. **${med.name}** (${med.type})\n`;
          response += `   • Indications : ${med.indications.join(", ")}\n`;
          response += `   • Posologie : ${med.dosage}\n`;
          if (med.contraindications.length > 0) {
            response += `   • Contre-indications : ${med.contraindications.join(", ")}\n`;
          }
          response += "\n";
        });
      }
    }

    // Si aucune correspondance trouvée
    if (relevantDiseases.length === 0 && (!hasMedicationQuery || findRelevantMedications(userInput).length === 0)) {
      response = "🤔 Je n'ai pas trouvé d'informations spécifiques pour votre demande.\n\n";
      response += "**Suggestions :**\n";
      response += "• Décrivez plus précisément vos symptômes\n";
      response += "• Mentionnez la localisation et l'intensité\n";
      response += "• Précisez depuis quand vous ressentez ces symptômes\n\n";
      response += "**Spécialités disponibles :**\n";
      medicalKnowledge.specialties_info.forEach(specialty => {
        response += `• ${specialty.name} : ${specialty.description}\n`;
      });
    }

    // Message de disclaimer
    response += "\n---\n";
    response += "⚠️ **Important** : Cette information est fournie à titre indicatif. Consultez toujours un professionnel de santé pour un diagnostic et un traitement appropriés.";

    return response;
  };

  const sendMessage = useCallback(async (userMessage) => {
    setIsLoading(true);
    
    // Ajouter le message utilisateur
    const userMsg = {
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Générer la réponse
    const botResponse = generateResponse(userMessage);
    
    const botMsg = {
      content: botResponse,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading
  };
};