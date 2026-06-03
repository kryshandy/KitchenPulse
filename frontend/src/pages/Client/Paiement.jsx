import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/axiosConfig';

const Paiement = ({ onClearCart }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalPrix, cartItems, nbPersonnes, totalKcal } = location.state || { totalPrix: 0, cartItems: [], nbPersonnes: 1, totalKcal: 0 };

  const [method, setMethod] = useState('om');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayer = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // On envoie les items complets (avec noteClient et caloriesSouhaitees) au backend
      await API.post('/orders', { 
        items: cartItems, 
        nbPersonnes, 
        total: totalPrix, 
        kcalTotal: totalKcal,
        modePaiement: method 
      });
      alert("✅ Commande personnalisée transmise avec succès au cuisinier !");
    } catch (error) {
      console.warn("Backend déconnecté. Affichage de la simulation de cuisine.");
      alert(`✅ [Simulation] Commande de ${totalPrix.toLocaleString('fr-FR')} FCFA validée via ${method.toUpperCase()} !\nLes choix d'ingrédients et calories ont bien été enregistrés pour le cuisinier.`);
    } finally {
      onClearCart();
      setLoading(false);
      navigate('/');
    }
  };

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '8px', maxWidth: '450px', margin: '0 auto', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>💵 Finalisation du règlement</h3>
      <h4 style={{ textAlign: 'center', color: '#28a745', fontSize: '22px', margin: '0 0 25px 0' }}>{totalPrix.toLocaleString('fr-FR')} FCFA</h4>
      
      <form onSubmit={handlePayer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Sélectionnez votre moyen de paiement :</label>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff' }}
          >
            <option value="om">🍊 Orange Money</option>
            <option value="momo">💛 MTN Mobile Money</option>
            <option value="especes">💵 Espèces / Cash à la caisse</option>
            <option value="carte">💳 Carte Bancaire (Visa/Mastercard)</option>
          </select>
        </div>

        {(method === 'om' || method === 'momo') && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>Numéro de téléphone mobile :</label>
            <input 
              type="tel" 
              required 
              placeholder="Ex: 0707070707" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        )}

        {method === 'especes' && (
          <div style={{ background: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '4px', fontSize: '13px', border: '1px solid #ffeeba' }}>
            📌 Le cuisinier prépare votre repas personnalisé, vous règlerez en espèces directement à la caisse.
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || totalPrix === 0}
          style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}
        >
          {loading ? "Transmission..." : "Confirmer et envoyer en Cuisine"}
        </button>
      </form>
    </div>
  );
};

export default Paiement;