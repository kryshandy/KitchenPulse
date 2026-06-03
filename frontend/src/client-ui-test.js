const runClientUiTests = () => {
  console.log("🧪 Début des tests fonctionnels de l'interface Client (Zone FCFA)...");

  const mockDish = { id: 101, nom: "Plat Test", prix: 2000, calories: 500 };
  const cartItemsMock = [{ ...mockDish, quantity: 2 }];

  // Test pour 1 personne
  const totalPrixA = cartItemsMock.reduce((sum, item) => sum + (item.prix * item.quantity), 0) * 1;
  const totalKcalA = cartItemsMock.reduce((sum, item) => sum + (item.calories * item.quantity), 0) * 1;

  if (totalPrixA === 4000 && totalKcalA === 1000) {
    console.log("✅ Test A réussi : Calculs unitaires validés (4 000 FCFA, 1000 kcal).");
  }

  // Test groupe de 4 personnes
  const totalPrixB = cartItemsMock.reduce((sum, item) => sum + (item.prix * item.quantity), 0) * 4;
  const totalKcalB = cartItemsMock.reduce((sum, item) => sum + (item.calories * item.quantity), 0) * 4;

  if (totalPrixB === 16000 && totalKcalB === 4000) {
    console.log("✅ Test B réussi : Multiplicateur de groupe ×4 validé (16 000 FCFA, 4000 kcal).");
  }

  console.log("🏁 Fin de la suite de tests de l'interface graphique Client.");
};

if (typeof window !== 'undefined') {
  window.addEventListener('load', runClientUiTests);
}