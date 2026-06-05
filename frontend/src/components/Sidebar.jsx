import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, isOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Équipe & Rôles', icon: '👥' },
    { id: 'menu', label: 'Carte & Menu', icon: '🍽️' },
    { id: 'orders', label: 'Commandes', icon: '🧑‍🍳' },
  ];

  return (
    <div style={{
      ...styles.sidebar,
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      opacity: isOpen ? 1 : 0
    }}>
      <div style={styles.brandZone}>
        <div style={styles.logoIcon}>KP</div>
        <div>
          <h2 style={styles.brandTitle}>KitchenPulse</h2>
          <span style={styles.brandBadge}>Espace Admin</span>
        </div>
      </div>
      
      <nav style={styles.menuList}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.menuButton,
                backgroundColor: isActive ? '#f97316' : 'transparent', // Orange Doux moderne
                color: isActive ? '#ffffff' : '#94a3b8',
                boxShadow: isActive ? '0 10px 25px -5px rgba(249, 115, 22, 0.4)' : 'none',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={styles.footerZone}>
        <p style={styles.version}>KitchenPulse v1.0</p>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a', // Fond sombre ultra pro pour le contraste
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 150,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  brandZone: {
    padding: '35px 24px 25px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #1e293b',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#f97316',
    color: '#ffffff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)'
  },
  brandTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' },
  brandBadge: { fontSize: '10px', color: '#f97316', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' },
  menuList: { padding: '30px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 },
  menuButton: {
    display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px',
    border: 'none', borderRadius: '14px', fontSize: '14px', textAlign: 'left',
    cursor: 'pointer', transition: 'all 0.2s ease', width: '100%',
  },
  footerZone: { padding: '20px 24px', borderTop: '1px solid #1e293b' },
  version: { margin: 0, fontSize: '11px', color: '#475569', textAlign: 'center' }
};

export default Sidebar;