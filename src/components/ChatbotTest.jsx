import React, { useState } from 'react';

const ChatbotTest = () => {
  const [testResult, setTestResult] = useState('');
  const [testMessage, setTestMessage] = useState("Bonjour, j'ai mal au poumon et je tousse depuis deux jours");

  const runTest = async () => {
    setTestResult('Test en cours...');
    
    try {
      // Test direct de la normalisation
      const normalizeText = (text) => {
        return text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      };

      const normalized = normalizeText(testMessage);
      
      // Importer et tester la base de données
      const response = await fetch('/src/data/enhanced_medical_knowledge.json');
      const medicalData = await response.json();
      
      // Chercher des correspondances directes
      let foundDiseases = [];
      
      Object.entries(medicalData.specialties).forEach(([key, specialty]) => {
        specialty.diseases.forEach(disease => {
          const hasRelevantSymptoms = disease.symptoms.some(symptom => 
            normalized.includes(symptom.toLowerCase()) ||
            symptom.toLowerCase().includes('toux') ||
            symptom.toLowerCase().includes('mal au poumon') ||
            symptom.toLowerCase().includes('douleur thoracique')
          );
          
          if (hasRelevantSymptoms) {
            foundDiseases.push({
              name: disease.name,
              specialty: specialty.name,
              symptoms: disease.symptoms,
              matchedSymptoms: disease.symptoms.filter(s => 
                normalized.includes(s.toLowerCase()) ||
                s.toLowerCase().includes('toux') ||
                s.toLowerCase().includes('mal') ||
                s.toLowerCase().includes('poumon')
              )
            });
          }
        });
      });

      setTestResult(`
RÉSULTATS DU TEST :
===================

Message testé: "${testMessage}"
Normalisé: "${normalized}"

Maladies trouvées: ${foundDiseases.length}

${foundDiseases.map((disease, index) => `
${index + 1}. ${disease.name} (${disease.specialty})
   Symptômes correspondants: ${disease.matchedSymptoms.join(', ')}
   Tous les symptômes: ${disease.symptoms.join(', ')}
`).join('')}

${foundDiseases.length === 0 ? '❌ PROBLÈME: Aucune maladie détectée!' : '✅ Détection OK'}
      `);
      
    } catch (error) {
      setTestResult(`❌ ERREUR: ${error.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 m-4">
      <h3 className="font-semibold mb-3">🔧 Diagnostic du Chatbot Médical</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Message de test:</label>
        <textarea 
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          rows="2"
        />
      </div>
      
      <button 
        onClick={runTest}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        🧪 Tester la détection
      </button>
      
      {testResult && (
        <pre className="mt-4 p-3 bg-white border rounded text-xs overflow-auto max-h-96">
          {testResult}
        </pre>
      )}
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <strong>📋 Instructions:</strong>
        <br />• Cliquez sur "Tester la détection" pour diagnostiquer le problème
        <br />• Vérifiez si les maladies respiratoires sont bien détectées
        <br />• Le chatbot doit trouver: Bronchite aiguë, Pneumonie, Infection respiratoire
      </div>
    </div>
  );
};

export default ChatbotTest;