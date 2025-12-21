// Test spécifique pour les problèmes gynécologiques
const fs = require('fs');

console.log('👩‍⚕️ TEST PROBLÈMES GYNÉCOLOGIQUES\n');

// Charger les données médicales
const medicalData = JSON.parse(fs.readFileSync('./src/data/enhanced_medical_knowledge.json', 'utf8'));

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

// Tests des questions problématiques
const testQuestions = [
  "J'ai des douleurs dans le bas-ventre",
  "J'ai un retard de règles depuis plusieurs jours",
  "J'ai des pertes vaginales anormales"
];

testQuestions.forEach((question, index) => {
  console.log(`🧪 TEST ${index + 1}: "${question}"`);
  
  let bestMatches = [];
  
  // Analyser dans la spécialité gynécologie
  const gyneco = medicalData.specialties.gynecologie;
  gyneco.diseases.forEach(disease => {
    disease.symptoms.forEach(symptom => {
      const similarity = calculateSimilarity(question, symptom);
      if (similarity > 0) {
        bestMatches.push({
          disease: disease.name,
          symptom: symptom,
          similarity: similarity.toFixed(3),
          treatments: disease.treatments
        });
      }
    });
  });
  
  // Trier par similarité
  bestMatches.sort((a, b) => b.similarity - a.similarity);
  
  if (bestMatches.length > 0) {
    console.log(`   ✅ DÉTECTÉ: ${bestMatches[0].disease}`);
    console.log(`   📝 Symptôme: "${bestMatches[0].symptom}"`);
    console.log(`   🎯 Similarité: ${bestMatches[0].similarity}`);
    console.log(`   💊 Traitement: ${bestMatches[0].treatments[0]}`);
  } else {
    console.log(`   ❌ NON DÉTECTÉ`);
  }
  console.log('');
});

// Vérifier les nouvelles maladies ajoutées
console.log('📋 NOUVELLES MALADIES GYNÉCOLOGIQUES:');
const gyneco = medicalData.specialties.gynecologie;
gyneco.diseases.forEach(disease => {
  console.log(`   🩺 ${disease.name} (${disease.symptoms.length} symptômes)`);
});

console.log('\n🎯 RÉSULTAT: Les questions gynécologiques devraient maintenant être détectées !');