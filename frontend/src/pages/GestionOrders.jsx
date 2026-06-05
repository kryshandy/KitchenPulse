import React, { useState } from 'react';

const GestionOrders = () => {
  // Simulation de commandes en cours pour le visuel de production
  const [orders, setOrders] = useState([
    { id: 101, table: "Table 4", items: "2x Ndolé Royal, 1x Jus de Bissap", total: 7500, status: "EN_ATTENTE", time: "Il y a 5 min" },
    { id: 102, table: "Table 1", items: "1x Poulet DG, 2x Eau Minérale", total: 5000, status: "PREPARATION", time: "Il y a 12 min" },
    { id: 103, table: "À emporter", items: "3x Soya Spécial, 3x Coca-Cola", total: 9000, status: "PRET", time: "Il y a 2 min" },
  ]);

  // Fonction pour faire avancer le statut d'une commande
  const advanceStatus = (orderId, currentStatus) => {
    const nextStatusMap = {
      "EN_ATTENTE": "PREPARATION",
      "PREPARATION": "PRET",
      "PRET": "SERVI"
    };

    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: nextStatusMap[currentStatus] } : order
    ).filter(order => order.status !== "SERVI")); // On retire si c'est servi
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'EN_ATTENTE': return { label: '⏳ En attente', color: '#ef4444', bg: '#fef2f2' };
      case 'PREPARATION': return { label: '🧑‍🍳 En cuisine', color: '#f97316', bg: '#fff7ed' };
      case 'PRET': return { label: '✅ Prêt', color: '#16a34a', bg: '#f0fdf4' };
      default: return { label: 'Statut', color: '#475569', bg: '#f1f5f9' };
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Suivi des Commandes</h1>
          <p style={styles.subtitle}>Pilotez le flux entre la salle, la cuisine et le service en temps réel.</p>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div style={styles.kanbanGrid}>
        
        {/* Colonne 1 : Reçues */}
        <div style={styles.column}>
          <div style={{ ...styles.columnHeader, borderLeft: '4px solid #ef4444' }}>
            <h3>Nouvelles requêtes</h3>
            <span style={{ ...styles.countBadge, backgroundColor: '#fef2f2', color: '#ef4444' }}>
              {orders.filter(o => o.status === 'EN_ATTENTE').length}
            </span>
          </div>
          <div style={styles.cardContainer}>
            {orders.filter(o => o.status === 'EN_ATTENTE').map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.cardTop}>
                  <span style={styles.orderId}>#CMD-{order.id}</span>
                  <span style={styles.timeTag}>{order.time}</span>
                </div>
                <div style={styles.tableName}>{order.table}</div>
                <div style={styles.itemsList}>{order.items}</div>
                <div style={styles.cardDivider}></div>
                <div style={styles.cardBottom}>
                  <div style={styles.price}>{order.total.toLocaleString()} FCFA</div>
                  <button onClick={() => advanceStatus(order.id, order.status)} style={{ ...styles.actionBtn, backgroundColor: '#f97316' }}>
                    Lancer 🧑‍🍳
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne 2 : En Préparation */}
        <div style={styles.column}>
          <div style={{ ...styles.columnHeader, borderLeft: '4px solid #f97316' }}>
            <h3>En Préparation</h3>
            <span style={{ ...styles.countBadge, backgroundColor: '#fff7ed', color: '#f97316' }}>
              {orders.filter(o => o.status === 'PREPARATION').length}
            </span>
          </div>
          <div style={styles.cardContainer}>
            {orders.filter(o => o.status === 'PREPARATION').map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.cardTop}>
                  <span style={styles.orderId}>#CMD-{order.id}</span>
                  <span style={styles.timeTag}>{order.time}</span>
                </div>
                <div style={styles.tableName}>{order.table}</div>
                <div style={styles.itemsList}>{order.items}</div>
                <div style={styles.cardDivider}></div>
                <div style={styles.cardBottom}>
                  <div style={styles.price}>{order.total.toLocaleString()} FCFA</div>
                  <button onClick={() => advanceStatus(order.id, order.status)} style={{ ...styles.actionBtn, backgroundColor: '#16a34a' }}>
                    Prêt ! ✅
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne 3 : Prêt à Servir */}
        <div style={styles.column}>
          <div style={{ ...styles.columnHeader, borderLeft: '4px solid #16a34a' }}>
            <h3>Prêt à Servir</h3>
            <span style={{ ...styles.countBadge, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              {orders.filter(o => o.status === 'PRET').length}
            </span>
          </div>
          <div style={styles.cardContainer}>
            {orders.filter(o => o.status === 'PRET').map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.cardTop}>
                  <span style={styles.orderId}>#CMD-{order.id}</span>
                  <span style={styles.timeTag}>{order.time}</span>
                </div>
                <div style={styles.tableName}>{order.table}</div>
                <div style={styles.itemsList}>{order.items}</div>
                <div style={styles.cardDivider}></div>
                <div style={styles.cardBottom}>
                  <div style={styles.price}>{order.total.toLocaleString()} FCFA</div>
                  <button onClick={() => advanceStatus(order.id, order.status)} style={{ ...styles.actionBtn, backgroundColor: '#0f172a' }}>
                    Servi 🚀
                  </button>
                </div>
              </div>
            ))}
          </div>
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
  kanbanGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' },
  column: { backgroundColor: '#f8fafc', borderRadius: '24px', padding: '20px', border: '1px solid #e2e8f0', minHeight: '60vh' },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '12px', marginBottom: '20px', '& h3': { margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' } },
  countBadge: { fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '99px' },
  cardContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: { backgroundColor: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.02)', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: '12px', fontWeight: '700', color: '#94a3b8' },
  timeTag: { fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' },
  tableName: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  itemsList: { fontSize: '14px', color: '#475569', lineHeight: '1.4' },
  cardDivider: { height: '1px', backgroundColor: '#f1f5f9', margin: '5px 0' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontWeight: '700', color: '#ea580c', fontSize: '15px' },
  actionBtn: { border: 'none', color: '#ffffff', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.1s ease', ':active': { transform: 'scale(0.95)' } }
};

export default GestionOrders;