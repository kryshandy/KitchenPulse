import React, { useState, useEffect } from 'react';

const GestionUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Charger la liste des utilisateurs depuis le backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/users');
      if (!response.ok) throw new Error('Impossible de récupérer le personnel.');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Modifier le rôle d'un utilisateur en direct
  const handleRoleChange = async (userId, newRole) => {
    try {
      setSuccessMessage('');
      const response = await fetch(`http://localhost:3001/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`Rôle mis à jour avec succès !`);
        // Mettre à jour l'état local pour éviter de recharger la page
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.message || "Erreur lors du changement de rôle.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion avec le serveur.");
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '15px', color: '#64748b' }}>Chargement de l'équipe KitchenPulse...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerSection}>
        <h1 style={styles.mainTitle}>👥 Gestion du Personnel</h1>
        <p style={styles.subTitle}>Attribuez, modifiez et contrôlez les rôles d'accès des employés du restaurant.</p>
      </div>

      {/* Notification Flash */}
      {successMessage && (
        <div style={styles.flashSuccess}>
          ✨ {successMessage}
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div style={styles.tableBlock}>
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Nom complet</th>
                <th style={styles.th}>Adresse Email</th>
                <th style={styles.th}>Rôle Actuel</th>
                <th style={styles.th}>Actions d'Administration</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.emptyCell}>Aucun membre du personnel enregistré pour le moment.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '600', color: '#0f172a' }}>
                      👤 {user.name}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{user.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        backgroundColor: 
                          user.role === 'ADMIN' ? '#fee2e2' : 
                          user.role === 'SERVEUR' ? '#e0f2fe' : '#fef3c7',
                        color: 
                          user.role === 'ADMIN' ? '#ef4444' : 
                          user.role === 'SERVEUR' ? '#0284c7' : '#d97706'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={styles.selectAction}
                      >
                        <option value="SERVEUR">Passer SERVEUR</option>
                        <option value="CUISINIER">Passer CUISINIER</option>
                        <option value="ADMIN">Passer ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif" },
  headerSection: { marginBottom: '35px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' },
  mainTitle: { fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '0 0 5px 0' },
  subTitle: { fontSize: '15px', color: '#64748b', margin: 0 },
  flashSuccess: { padding: '12px 20px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', animation: 'fadeIn 0.3s ease' },
  tableBlock: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { backgroundColor: '#f8fafc' },
  th: { padding: '16px', color: '#475569', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
  td: { padding: '16px', fontSize: '14px', color: '#334155' },
  roleBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  selectAction: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '500', cursor: 'pointer', outline: 'none' },
  emptyCell: { padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
  centerContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  spinner: { width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default GestionUsers;