import React, { useState } from 'react';

const DishCard = ({ dish, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [showCustom, setShowCustom] = useState(false);
  const [customIngredients, setCustomIngredients] = useState('');
  const [customCalories, setCustomCalories] = useState('');

  const handleAddClick = () => {
    // On envoie le plat avec la quantité choisie et les demandes pour le cuisinier
    onAddToCart({
      ...dish,
      noteClient: customIngredients ? `Ingrédients souhaités/retirés : ${customIngredients}` : '',
      caloriesSouhaitees: customCalories ? `${customCalories} kcal` : ''
    }, quantity);

    // Réinitialisation après ajout
    setQuantity(1);
    setCustomIngredients('');
    setCustomCalories('');
    setShowCustom(false);
  };

  return (
    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div>
        <h4 style={{ margin: '0 0 10px 0', color: '#222', fontSize: '16px' }}>{dish.nom}</h4>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 10px 0' }}>{dish.description}</p>
        <span style={{ fontSize: '11px', color: '#e03e2d', fontWeight: 'bold', background: '#fff5f5', padding: '2px 6px', borderRadius: '4px' }}>🔥 Base : {dish.calories} kcal</span>
        
        {/* Bouton pour afficher les options de composition */}
        <button 
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          style={{ display: 'block', margin: '10px 0 5px 0', background: '#f8f9fa', border: '1px dashed #ccc', padding: '5px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', width: '100%', textAling: 'center' }}
        >
          {showCustom ? "❌ Annuler la personnalisation" : "⚙️ Composer / Personnaliser ce plat"}
        </button>

        {/* Zone de composition personnalisée */}
        {showCustom && (
          <div style={{ background: '#f1f3f5', padding: '10px', borderRadius: '5px', marginTop: '5px', fontSize: '12px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Ingrédients à ajouter / enlever :</label>
            <textarea 
              placeholder="Ex: Sans piment, double portion d'oignons..." 
              value={customIngredients}
              onChange={(e) => setCustomIngredients(e.target.value)}
              style={{ width: '100%', height: '50px', boxSizing: 'border-box', marginBottom: '8px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none' }}
            />
            
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Calories ciblées pour ce plat (kcal) :</label>
            <input 
              type="number" 
              placeholder="Ex: 500" 
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{dish.prix.toLocaleString('fr-FR')} FCFA</span>
          
          {/* Choix de la quantité AVANT d'ajouter au panier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Qté :</span>
            <input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '45px', padding: '5px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <button 
          onClick={handleAddClick}
          style={{ width: '100%', background: '#007bff', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};

export default DishCard;