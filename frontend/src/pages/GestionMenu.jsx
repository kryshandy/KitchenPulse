import React, { useState, useEffect } from 'react';

const GestionMenu = () => {
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire de création d'un plat
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('PLAT');

  // Charger les plats existants au démarrage
  useEffect(() => {
    fetchPlats();
  }, []);

  const fetchPlats = async () => {
    try {
      setLoading(true);
      // Remplace par ton endpoint d'API réel quand tes routes seront prêtes
      const response = await fetch('http://localhost:3001/api/plats'); 
      const result = await response.json();
      if (result.success) setPlats(result.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des plats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlat = async (e) => {
    e.preventDefault();
    if (!name || !price) return alert("Veuillez remplir tous les champs !");

    const newPlat = {
      name,
      price: parseFloat(price),
      category
    };

    try {
      const response = await fetch('http://localhost:3001/api/plats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlat)
      });
      const result = await response.json();
      
      if (result.success) {
        alert("✨ Plat ajouté avec succès !");
        setName('');
        setPrice('');
        fetchPlats(); // Recharger la liste
      }
    } catch (err) {
      console.error("Erreur ajout plat:", err);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestion de la Carte</h1>
          <p style={styles.subtitle}>Ajoutez de nouvelles saveurs et gérez les tarifs du restaurant.</p>
        </div>
      </div>

      <div style={styles.contentLayout}>
        {/* Formulaire d'Ajout (Colonne Gauche) */}
        <div style={styles.formBox}>
          <h3 style={styles.boxTitle}>➕ Ajouter un nouveau plat</h3>
          <form onSubmit={handleAddPlat} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom du plat / de la boisson</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ndolé Royal, Jus de Bissap..." 
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Prix de vente (FCFA)</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 3500" 
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Catégorie</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                <option value="ENTREE">🥗 Entrée</option>
                <option value="PLAT">🍽️ Plat principal</option>
                <option value="BOISSON">🍹 Boisson</option>
                <option value="DESSERT">🍰 Dessert</option>
              </select>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Enregistrer à la carte
            </button>
          </form>
        </div>

        {/* Liste des Plats (Colonne Droite) */}
        <div style={styles.listBox}>
          <h3 style={styles.boxTitle}>📋 Menu Actuel</h3>
          {loading ? (
            <p style={{ color: '#ea580c', fontWeight: '500' }}>Chargement de la carte...</p>
          ) : plats.length === 0 ? (
            <div style={styles.emptyState}>
              <span>🍽️</span>
              <p style={{ color: '#64748b', margin: '5px 0 0', fontSize: '14px' }}>Aucun article créé.</p>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Utilisez le formulaire pour garnir votre carte.</p>
            </div>
          ) : (
            <div style={styles.listContainer}>
              {plats.map((plat) => (
                <div key={plat.id} style={styles.platItem}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{plat.name}</div>
                    <span style={styles.catBadge}>{plat.category}</span>
                  </div>
                  <div style={styles.priceTag}>{Number(plat.price).toLocaleString()} FCFA</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { maxWidth: '1200px', margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" },
  header: { marginBottom: '35px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' },
  contentLayout: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', alignItems: 'start' },
  formBox: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.04)' },
  listBox: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.04)' },
  boxTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 20px 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#64748b' },
  input: { padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
  select: { padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer' },
  submitBtn: { marginTop: '10px', padding: '14px', backgroundColor: '#f97316', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(249, 115, 22, 0.2)', transition: 'background-color 0.2s' },
  emptyState: { padding: '40px', textAlign: 'center', border: '2px dashed #fed7aa', borderRadius: '16px', backgroundColor: '#fffdfb' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  platItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fdf8f5', border: '1px solid #ffedd5', borderRadius: '14px' },
  catBadge: { display: 'inline-block', marginTop: '4px', fontSize: '11px', fontWeight: '700', backgroundColor: '#eaeef6', color: '#475569', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' },
  priceTag: { fontWeight: '700', color: '#ea580c', fontSize: '15px' }
};

export default GestionMenu;