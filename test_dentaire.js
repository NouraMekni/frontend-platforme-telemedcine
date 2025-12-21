// Test spécifique pour les problèmes dentaires
const fs = require('fs');

console.log('🦷 TEST PROBLÈMES DENTAIRES\n');

// Charger les données médicales
const medicalData = JSON.parse(fs.readFileSync('./src/data/enhanced_medical_knowledge.json', 'utf8'));

// Vérifier si l'odontologie existe
if (medicalData.specialties.odontologie) {
  console.log('✅ Spécialité Odontologie trouvée !');
  console.log(`📋 Nombre de maladies dentaires: ${medicalData.specialties.odontologie.diseases.length}\n`);
  
  // Test pour chaque maladie dentaire
  medicalData.specialties.odontologie.diseases.forEach(disease => {
    console.log(`🦷 ${disease.name.toUpperCase()}`);
    console.log(`   Symptômes: ${disease.symptoms.slice(0, 3).join(', ')}...`);
    console.log(`   Traitements: ${disease.treatments.slice(0, 2).join(', ')}...`);
    console.log(`   Gravité: ${disease.severity}\n`);
  });
  
  // Test spécifique pour abcès (joue gonflée)
  const abces = medicalData.specialties.odontologie.diseases.find(d => d.id === 'abces_dentaire');
  if (abces) {
    console.log('🎯 TEST SYMPTÔME "joue gonflée" :');
    const hasSymptom = abces.symptoms.includes('joue gonflée');
    console.log(`   ✅ "joue gonflée" détecté: ${hasSymptom}`);
    console.log(`   💊 Médicaments: ${abces.treatments.join(', ')}\n`);
  }
  
  // Test spécifique pour mal aux dents
  const carie = medicalData.specialties.odontologie.diseases.find(d => d.id === 'carie_dentaire');
  if (carie) {
    console.log('🎯 TEST SYMPTÔME "mal aux dents" :');
    const hasSymptom = carie.symptoms.includes('mal aux dents');
    console.log(`   ✅ "mal aux dents" détecté: ${hasSymptom}`);
    console.log(`   💊 Médicaments: ${carie.treatments.join(', ')}\n`);
  }
  
} else {
  console.log('❌ Spécialité Odontologie non trouvée !');
}

console.log('🧪 QUESTIONS À TESTER DANS LE CHATBOT:');
console.log('1️⃣ "J\'ai mal aux dents et ma joue est gonflée"');
console.log('2️⃣ "Mes gencives saignent quand je me brosse les dents"');
console.log('3️⃣ "J\'ai une rage de dents insupportable"');
console.log('4️⃣ "Ma dent de sagesse me fait mal"');
console.log('\n🦷 Le chatbot devrait maintenant reconnaître tous ces problèmes dentaires !');