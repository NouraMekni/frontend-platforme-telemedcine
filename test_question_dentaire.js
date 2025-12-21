// Test direct de la question "J'ai mal aux dents et ma joue est gonflée"
const fs = require('fs');

console.log('🧪 TEST DIRECT - Question dentaire\n');

const medicalData = JSON.parse(fs.readFileSync('./src/data/enhanced_medical_knowledge.json', 'utf8'));

// Simuler la question de l'utilisateur
const userMessage = "J'ai mal aux dents et ma joue est gonflée";
console.log(`❓ Question: "${userMessage}"\n`);

// Fonction de normalisation du texte (comme dans le chatbot)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^\w\s]/g, ' ') // Remplacer la ponctuation par des espaces
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples
    .trim();
};

// Fonction de similarité (comme dans le chatbot)
const calculateSimilarity = (text1, text2) => {
  const words1 = normalizeText(text1).split(' ').filter(word => word.length > 2);
  const words2 = normalizeText(text2).split(' ').filter(word => word.length > 2);
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.includes(word)) {
      matches++;
    }
  });
  
  return matches / Math.max(words1.length, words2.length);
};

// Analyser tous les symptômes
console.log('🔍 ANALYSE DES SYMPTÔMES:\n');

let bestMatches = [];

Object.entries(medicalData.specialties).forEach(([specialtyKey, specialty]) => {
  specialty.diseases.forEach(disease => {
    disease.symptoms.forEach(symptom => {
      const similarity = calculateSimilarity(userMessage, symptom);
      if (similarity > 0) {
        bestMatches.push({
          specialty: specialty.name,
          disease: disease.name,
          symptom: symptom,
          similarity: similarity.toFixed(3),
          treatments: disease.treatments
        });
      }
    });
  });
});

// Trier par similarité
bestMatches.sort((a, b) => b.similarity - a.similarity);

// Afficher les meilleurs résultats
console.log('🎯 MEILLEURS MATCHES:');
bestMatches.slice(0, 5).forEach((match, index) => {
  console.log(`${index + 1}. ${match.disease} (${match.specialty})`);
  console.log(`   Symptôme: "${match.symptom}"`);
  console.log(`   Similarité: ${match.similarity}`);
  console.log(`   Traitements: ${match.treatments.slice(0, 2).join(', ')}...\n`);
});

// Vérifier si on trouve bien l'abcès dentaire
const abcesMatch = bestMatches.find(m => m.disease === 'Abcès dentaire');
if (abcesMatch) {
  console.log('✅ ABCÈS DENTAIRE DÉTECTÉ !');
  console.log(`   Similarité: ${abcesMatch.similarity}`);
  console.log(`   🦷 Le chatbot devrait recommander un dentiste !`);
} else {
  console.log('❌ Abcès dentaire non détecté...');
}