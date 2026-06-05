import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    summary: { total_revenue: 0, total_orders: 0, average_basket: 0 },
    lowStocksWarning: [],
    topRatedDishes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/stats/dashboard')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setStats(resData.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#ea580c', fontWeight: '600' }}>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tableau de Bord Principal</h1>
          <p style={styles.subtitle}>Suivi de performance de l'établissement KitchenPulse.</p>
        </div>
        <div style={styles.liveBadge}>
          <span style={styles.pulseDot}></span> Synchro Live
        </div>
      </div>

      {/* Cartes Volumétriques Orange & Ambre */}
      <div style={styles.gridCards}>
        
        {/* Carte CA */}
        <div style={{ ...styles.card, background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa' }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Chiffre d'Affaires</span>
            <span style={styles.cardIcon}>💰</span>
          </div>
          <h2 style={styles.cardValue}>{Number(stats.summary.total_revenue).toLocaleString()} <span style={styles.currency}>FCFA</span></h2>
          <p style={styles.cardFooter}>Cumulé sur la période active</p>
        </div>

        {/* Carte Commandes */}
        <div style={{ ...styles.card, background: 'linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)', border: '1px solid #fba556' }}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardLabel, color: '#7c2d12' }}>Commandes Totales</span>
            <span style={styles.cardIcon}>📦</span>
          </div>
          <h2 style={{ ...styles.cardValue, color: '#7c2d12' }}>{stats.summary.total_orders} <span style={{ ...styles.currency, color: '#9a3412' }}>flux</span></h2>
          <p style={{ ...styles.cardFooter, color: '#9a3412' }}>Transactions enregistrées</p>
        </div>

        {/* Carte Panier Moyen */}
        <div style={{ ...styles.card, background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', border: 'none', boxShadow: '0 10px 25px rgba(234, 88, 12, 0.25)' }}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardLabel, color: '#ffedd5' }}>Panier Moyen</span>
            <span style={styles.cardIcon}>🛒</span>
          </div>
          <h2 style={{ ...styles.cardValue, color: '#ffffff' }}>{Math.round(stats.summary.average_basket).toLocaleString()} <span style={{ ...styles.currency, color: '#ffedd5' }}>FCFA</span></h2>
          <p style={{ ...styles.cardFooter, color: '#ffedd5', opacity: 0.8 }}>Par ticket client</p>
        </div>

      </div>

      {/* Blocs d'activité inférieurs */}
      <div style={styles.sectionsGrid}>
        
        <div style={styles.whiteBox}>
          <h3 style={styles.boxTitle}>⚠️ Ruptures & Alertes Stocks</h3>
          <div style={styles.emptyState}>
            <span style={{ fontSize: '32px' }}>🌱</span>
            <p style={{ color: '#475569', fontWeight: '500', margin: '8px 0 0' }}>Logistique impeccable</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>Aucun ingrédient en alerte critique actuellement.</p>
          </div>
        </div>

        <div style={styles.whiteBox}>
          <h3 style={styles.boxTitle}>⭐ Évaluation des Plats</h3>
          <div style={styles.emptyState}>
            <span style={{ fontSize: '32px' }}>🍽️</span>
            <p style={{ color: '#475569', fontWeight: '500', margin: '8px 0 0' }}>Aucun avis enregistré</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>Les notes des clients s'afficheront ici en direct.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  wrapper: { maxWidth: '1200px', margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #fed7aa', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', color: '#ea580c', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.05)' },
  pulseDot: { width: '8px', height: '8px', backgroundColor: '#f97316', borderRadius: '50%', display: 'inline-block' },
  gridCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '35px' },
  card: { borderRadius: '24px', padding: '28px', boxShadow: '0 10px 20px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardLabel: { fontSize: '14px', fontWeight: '600', color: '#ea580c' },
  cardIcon: { fontSize: '20px', background: 'rgba(255,255,255,0.4)', padding: '6px 10px', borderRadius: '10px' },
  cardValue: { fontSize: '32px', fontWeight: '700', color: '#2b1005', margin: 0, letterSpacing: '-1px' },
  currency: { fontSize: '16px', fontWeight: '500', color: '#7c2d12' },
  cardFooter: { fontSize: '12px', color: '#c2410c', margin: '12px 0 0 0', opacity: 0.9 },
  sectionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' },
  whiteBox: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.04)' },
  boxTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 20px 0' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px', border: '2px dashed #fed7aa', borderRadius: '16px', backgroundColor: '#fffdfb' }
};

export default Dashboard;