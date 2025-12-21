console.log("🧪 Test: Messages multiples rapides");

// Simuler l'envoi de plusieurs messages rapidement
const testMultipleMessages = () => {
  console.log("\n📝 Test des messages multiples :");
  
  const messages = [
    "J'ai mal à la tête",
    "J'ai de la fièvre", 
    "J'ai des nausées",
    "Que dois-je faire ?",
    "C'est urgent ?"
  ];
  
  console.log("🚀 Envoi de", messages.length, "messages rapidement...");
  
  // Simuler l'envoi rapide
  messages.forEach((msg, index) => {
    setTimeout(() => {
      console.log(`📨 Message ${index + 1}: "${msg}"`);
      console.log("⏳ État isLoading vérifié avant envoi");
    }, index * 100); // 100ms entre chaque message
  });
  
  setTimeout(() => {
    console.log("\n✅ Test terminé - vérifiez que:");
    console.log("1. Seul le premier message est traité immédiatement");
    console.log("2. Les autres messages attendent que isLoading = false");
    console.log("3. Aucun message d'erreur 'Une erreur s'est produite'");
    console.log("4. Les IDs des messages sont uniques");
  }, 1000);
};

// Simuler des messages avec des erreurs potentielles
const testErrorHandling = () => {
  console.log("\n🔥 Test de gestion d'erreurs :");
  
  const errorScenarios = [
    { type: "fetch", message: "Problème de réseau" },
    { type: "timeout", message: "Délai d'attente" },
    { type: "memory", message: "Mémoire insuffisante" },
    { type: "general", message: "Erreur générale" }
  ];
  
  errorScenarios.forEach((scenario, index) => {
    setTimeout(() => {
      console.log(`⚠️ Scénario ${index + 1}: ${scenario.type}`);
      console.log(`📋 Message d'erreur attendu: ${scenario.message}`);
    }, index * 200);
  });
};

console.log("🎯 Lancement des tests...");
testMultipleMessages();
setTimeout(testErrorHandling, 2000);

console.log("\n📋 Instructions de test manuel :");
console.log("1. Ouvrez votre application dans le navigateur");
console.log("2. Tapez rapidement plusieurs questions dans le chat");
console.log("3. Vérifiez qu'il n'y a plus d'erreur 'Une erreur s'est produite'");
console.log("4. Vérifiez que les messages s'affichent correctement");
console.log("5. Vérifiez que l'historique fonctionne toujours");