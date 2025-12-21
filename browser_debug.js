// Script à exécuter dans la console du navigateur pour debugger

// 1. Effacer le cache
console.log("🧹 Nettoyage du cache...");
localStorage.removeItem('medical_chatbot_messages');
sessionStorage.clear();

// 2. Vérifier la version du hook utilisé
console.log("🔍 Vérification du hook...");
if (window.React) {
  console.log("React détecté");
}

// 3. Tester la fonction directement si possible
setTimeout(() => {
  console.log("🔬 Test dans 2 secondes...");
  console.log("Rafraîchissez la page et testez: 'J'ai mal à la poitrine quand je respire profondément'");
}, 2000);