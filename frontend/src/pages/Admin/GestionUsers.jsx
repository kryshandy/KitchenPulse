import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../hooks/useSocket';
import API from '../../api/axiosConfig';
import { toast } from 'react-toastify';

// -- SVG Icons -------------------------------------------------------

const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconBlock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);

const IconUnlock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

// -- Constantes ------------------------------------------------------

const ROLES = ['client', 'serveur', 'cuisinier', 'admin'];

// -- Composant principal ---------------------------------------------

const GestionUsers = () => {
  const { user: me, logout } = useAuth();
  const { T } = useTheme();
  const socket = useSocket();
  const navigate = useNavigate();

  const [tab,         setTab]         = useState('users');   // 'users' | 'pending'
  const [users,       setUsers]       = useState([]);
  const [pending,     setPending]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('');
  const [editingId,   setEditingId]   = useState(null);
  const [editRole,    setEditRole]    = useState('');
  const [pendingBadge, setPendingBadge] = useState(0);

  // -- Fetch utilisateurs actifs ------------------------------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/users');
      const data = res.data.data || res.data;
      setUsers(Array.isArray(data) ? data.filter(u => u.is_active) : []);
    } catch { toast.error('Erreur chargement utilisateurs'); }
    finally { setLoading(false); }
  }, []);

  // -- Fetch comptes en attente -------------------------------------
  const fetchPending = useCallback(async () => {
    try {
      const res = await API.get('/users/pending');
      const data = res.data.data || res.data;
      setPending(Array.isArray(data) ? data : []);
      setPendingBadge(Array.isArray(data) ? data.length : 0);
    } catch { toast.error('Erreur chargement demandes'); }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPending();
  }, [fetchUsers, fetchPending]);

  // -- Socket.io : nouvelle demande en temps réel -------------------
  useEffect(() => {
    if (!socket) return;
    const onNewRequest = (data) => {
      toast.info(`Nouvelle demande : ${data.first_name} ${data.last_name} (${data.role})`);
      fetchPending();
    };
    socket.on('staff_approval_pending', onNewRequest);
    return () => socket.off('staff_approval_pending', onNewRequest);
  }, [socket, fetchPending]);

  // -- Actions utilisateurs actifs ----------------------------------
  const handleRoleUpdate = async (id) => {
    try {
      await API.put(`/users/${id}`, { role: editRole });
      toast.success('Role mis a jour');
      setEditingId(null);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleToggleActive = async (u) => {
    try {
      await API.put(`/users/${u.id}`, { is_active: u.is_active ? 0 : 1 });
      toast.success(u.is_active ? 'Utilisateur desactive' : 'Utilisateur active');
      fetchUsers();
    } catch { toast.error('Erreur'); }
  };

  // -- Actions demandes en attente ----------------------------------
  const handleApprove = async (id) => {
    try {
      await API.patch(`/users/${id}/approve`);
      toast.success('Compte valide avec succes');
      fetchPending();
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Confirmer le refus de cette demande ? Le compte sera supprime.')) return;
    try {
      await API.patch(`/users/${id}/reject`);
      toast.info('Demande refusee');
      fetchPending();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  // -- Filtrage -----------------------------------------------------
  const displayed = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name  || '').toLowerCase().includes(q) ||
      (u.email      || '').toLowerCase().includes(q) ||
      (u.phone      || '').toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // -- Role badge config --------------------------------------------
  const roleConfig = {
    admin:     { color: T.red,    bg: `${T.red}18`    },
    cuisinier: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    serveur:   { color: T.accent, bg: `${T.accent}18` },
    client:    { color: T.green,  bg: `${T.green}18`  },
  };

  const RoleBadge = ({ role }) => {
    const cfg = roleConfig[role?.toLowerCase()] || { color: T.muted, bg: T.surface };
    return (
      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
        {role}
      </span>
    );
  };

  // -- Rendu --------------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/admin')} style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconBack />
          </button>
          <span style={{ fontWeight: 800, fontSize: 18, color: T.text }}>
            Gestion <span style={{ color: T.accent }}>Equipe</span>
          </span>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '8px 14px', background: `${T.red}18`, border: `1px solid ${T.red}30`, borderRadius: 10, color: T.red, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Deconnexion
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: T.surface, padding: 6, borderRadius: 12, border: `1px solid ${T.border}`, width: 'fit-content' }}>
          {[
            { key: 'users',   label: 'Utilisateurs actifs', icon: <IconUser /> },
            { key: 'pending', label: 'Demandes en attente', icon: <IconBell />, badge: pendingBadge },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'background .15s',
              background: tab === t.key ? T.accent : 'transparent',
              color:      tab === t.key ? '#fff'   : T.sub,
            }}>
              {t.icon} {t.label}
              {t.badge > 0 && (
                <span style={{ background: tab === t.key ? 'rgba(255,255,255,0.25)' : T.red, color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ---- Onglet Demandes en attente ---- */}
        {tab === 'pending' && (
          <div>
            {pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: T.muted }}>
                <div style={{ marginBottom: 12, opacity: 0.4 }}><IconBell /></div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.sub }}>Aucune demande en attente</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(u => (
                  <div key={u.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.accent}`, borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontWeight: 800, fontSize: 16 }}>
                        {(u.first_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 15 }}>
                          {u.first_name} {u.last_name}
                        </p>
                        <p style={{ margin: '3px 0 0', color: T.sub, fontSize: 13 }}>
                          {u.email || u.phone || '—'}
                        </p>
                        <div style={{ marginTop: 6 }}>
                          <RoleBadge role={u.role} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleApprove(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: `${T.green}18`, border: `1px solid ${T.green}40`, borderRadius: 10, color: T.green, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        <IconCheck /> Valider
                      </button>
                      <button onClick={() => handleReject(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: `${T.red}18`, border: `1px solid ${T.red}40`, borderRadius: 10, color: T.red, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        <IconClose /> Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- Onglet Utilisateurs actifs ---- */}
        {tab === 'users' && (
          <div>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <input
                type="text" placeholder="Rechercher (nom, email, telephone...)" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 200, padding: '11px 16px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text, fontSize: 14 }}
              />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                style={{ padding: '11px 16px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text, fontSize: 14, cursor: 'pointer' }}>
                <option value="">Tous les roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={fetchUsers} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', background: `${T.accent}18`, border: `1px solid ${T.accent}30`, borderRadius: 12, color: T.accent, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                <IconRefresh /> Actualiser
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {ROLES.map(r => {
                const count = users.filter(u => u.role === r).length;
                const cfg = roleConfig[r];
                return (
                  <div key={r} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px' }}>
                    <p style={{ margin: 0, color: T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{r}</p>
                    <p style={{ margin: '8px 0 0', color: cfg.color, fontSize: 26, fontWeight: 800 }}>{count}</p>
                  </div>
                );
              })}
            </div>

            {/* Tableau */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px 120px', gap: 16, padding: '14px 24px', borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                {['Utilisateur', 'Contact', 'Role', 'Statut', 'Actions'].map(h => (
                  <span key={h} style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Chargement...</div>
              ) : displayed.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Aucun utilisateur trouve.</div>
              ) : displayed.map((u, i) => (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px 120px', gap: 16, padding: '16px 24px', borderBottom: i < displayed.length - 1 ? `1px solid ${T.border}` : 'none', alignItems: 'center' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                      {(u.first_name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, color: T.text, fontWeight: 600, fontSize: 14 }}>{u.first_name || ''} {u.last_name || ''}</p>
                      <p style={{ margin: 0, color: T.muted, fontSize: 11 }}>ID #{u.id}</p>
                    </div>
                  </div>

                  <div>
                    <p style={{ margin: 0, color: T.text, fontSize: 13 }}>{u.email || '—'}</p>
                    <p style={{ margin: 0, color: T.muted, fontSize: 12 }}>{u.phone || '—'}</p>
                  </div>

                  {editingId === u.id ? (
                    <select value={editRole} onChange={e => setEditRole(e.target.value)}
                      style={{ padding: '6px 8px', background: T.bg, border: `1px solid ${T.accent}`, borderRadius: 8, color: T.text, fontSize: 13 }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <RoleBadge role={u.role} />
                  )}

                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.is_active ? `${T.green}18` : `${T.red}18`, color: u.is_active ? T.green : T.red }}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {editingId === u.id ? (
                      <>
                        <button onClick={() => handleRoleUpdate(u.id)} style={{ padding: '6px 10px', background: `${T.green}18`, border: `1px solid ${T.green}30`, borderRadius: 8, color: T.green, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><IconCheck /></button>
                        <button onClick={() => setEditingId(null)} style={{ padding: '6px 10px', background: `${T.red}18`, border: `1px solid ${T.red}30`, borderRadius: 8, color: T.red, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><IconClose /></button>
                      </>
                    ) : (
                      <>
                        {u.id !== me?.id && (
                          <button onClick={() => { setEditingId(u.id); setEditRole(u.role); }} style={{ padding: '6px 10px', background: `${T.accent}18`, border: `1px solid ${T.accent}30`, borderRadius: 8, color: T.accent, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><IconEdit /></button>
                        )}
                        {u.id !== me?.id && (
                          <button onClick={() => handleToggleActive(u)} style={{ padding: '6px 10px', background: u.is_active ? `${T.red}18` : `${T.green}18`, border: `1px solid ${u.is_active ? T.red : T.green}30`, borderRadius: 8, color: u.is_active ? T.red : T.green, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            {u.is_active ? <IconBlock /> : <IconUnlock />}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUsers;