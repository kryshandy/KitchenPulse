import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Panier = ({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const navigate = useNavigate();
  const [nbPersonnes, setNbPersonnes] = useState(1);

  const totalPrixUnitaire = cartItems.reduce((sum, item) => sum + item.prix * item.quantity, 0);
  const totalKcalUnitaire = cartItems.reduce((sum, item) => {
    // Si l'utilisateur a personnalisé la calorie, on extrait le nombre, sinon on prend la base
    const customKcal = item.caloriesSouhaitees ? parseInt(item.caloriesSouhaitees) : item.calories;
    return sum + customKcal * item.quantity;
  }, 0);

  const totalPrixFinal = totalPrixUnitaire * nbPersonnes;
  const totalKcalFinal = totalKcalUnitaire * nbPersonnes;

  if (cartItems.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>Votre menu personnalisé est vide 🛒</div>;
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 20px 0' }}>🛒 Récapitulatif de vos compositions</h3>
      
      <div style={{ marginBottom: '20px' }}>
        {cartItems.map((item, index) => {
          const displayKcal = item.caloriesSouhaitees ? parseInt(item.caloriesSouhaitees) : item.calories;
          return (
            <div key={index} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: '15px' }}>{item.nom}</strong>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '3px' }}>
                    {item.prix.toLocaleString('fr-FR')} FCFA × {item.quantity} ({displayKcal * item.quantity} kcal)
                  </div>
                  
                  {/* Affichage des instructions pour le cuisinier */}
                  {item.noteClient && (
                    <div style={{ fontSize: '12px', color: '#0056b3', background: '#e7f1ff', padding: '4px 8px', borderRadius: '4px', marginTop: '5px', fontWeight: '500' }}>
                      🍳 Instruction Cuisine : {item.noteClient}
                    </div>
                  )}
                  {item.caloriesSouhaitees && (
                    <div style={{ fontSize: '12px', color: '#bd2130', background: '#f8d7da', padding: '4px 8px', borderRadius: '4px', marginTop: '3px', fontWeight: '500' }}>
                      🎯 Calorie demandée : {item.caloriesSouhaitees}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1, item.noteClient)}
                    style={{ width: '50px', padding: '4px', textAlign: 'center' }}
                  />
                  <button onClick={() => onRemoveItem(item.id, item.noteClient)} style={{ color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Retirer</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>🧑‍🤝‍🧑 Nombre de couverts (Multiplicateur de groupe) :</label>
        <input 
          type="number" 
          min="1" 
          value={nbPersonnes} 
          onChange={(e) => setNbPersonnes(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ width: '80px', padding: '6px', fontSize: '16px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.6' }}>
        <p style={{ margin: 0 }}>Total Général : <span style={{ color: '#28a745', fontSize: '20px' }}>{totalPrixFinal.toLocaleString('fr-FR')} FCFA</span></p>
        <p style={{ fontSize: '13px', color: '#dc3545', margin: 0 }}>⚡ Apport énergétique total estimé : {totalKcalFinal.toLocaleString('fr-FR')} kcal</p>
      </div>

      <button 
        onClick={() => navigate('/client/paiement', { state: { cartItems, nbPersonnes, totalPrix: totalPrixFinal, totalKcal: totalKcalFinal } })}
        style={{ width: '100%', background: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Passer au paiement
      </button>
    </div>
  );
};

export default Panier;