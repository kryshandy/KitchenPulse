import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const T = {
  bg:'#0f172a', surface:'#1e293b', surfaceAlt:'#263148',
  border:'#334155', text:'#f1f5f9', muted:'#94a3b8',
  accent:'#f97316', accentBg:'rgba(249,115,22,0.12)',
  green:'#10b981', greenBg:'rgba(16,185,129,0.12)',
  amber:'#f59e0b', amberBg:'rgba(245,158,11,0.12)',
  blue:'#3b82f6',  blueBg:'rgba(59,130,246,0.12)',
  red:'#ef4444',   redBg:'rgba(239,68,68,0.12)',
};

const ROLES = ['CLIENT','SERVEUR','CUISINIER','ADMIN'];
const ROLE_COLORS = { ADMIN:[T.red,T.redBg], CUISINIER:[T.amber,T.amberBg], SERVEUR:[T.blue,T.blueBg], CLIENT:[T.green,T.greenBg] };

const RoleBadge = ({ role }) => {
  const [color, bg] = ROLE_COLORS[role] || [T.muted, T.surfaceAlt];
  return <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, background:bg, color }}>{role}</span>;
};

const GestionUsers = () => {
  const { user: me, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingId, setEditingId]   = useState(null);
  const [editRole, setEditRole]     = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:LIMIT });
      if (search)     params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await API.get(`/users?${params}`);
      setUsers(res.data.users || res.data);
      setTotal(res.data.total || 0);
    } catch { toast.error('Erreur chargement utilisateurs'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleUpdate = async (id) => {
    try {
      await API.put(`/users/${id}`, { role: editRole });
      toast.success('Rôle mis à jour !');
      setEditingId(null);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleToggleActive = async (u) => {
    try {
      await API.put(`/users/${u.id}`, { is_active: !u.is_active });
      toast.success(u.is_active ? 'Utilisateur désactivé' : 'Utilisateur activé');
      fetchUsers();
    } catch { toast.error('Erreur'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:"'Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;} @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}} .fadeUp{animation:fadeUp 0.3s ease;}
      `}</style>

      {/* Topbar */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => navigate('/admin')} style={{ width:36, height:36, borderRadius:10, background:T.surfaceAlt, border:`1px solid ${T.border}`, color:T.muted, cursor:'pointer', fontSize:18 }}>←</button>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:T.text }}>Gestion <span style={{ color:T.accent }}>Équipe</span></span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:T.muted, fontSize:13 }}>{total} membre{total>1?'s':''}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ padding:'8px 14px', background:T.redBg, border:`1px solid ${T.red}30`, borderRadius:10, color:T.red, fontSize:13, fontWeight:600, cursor:'pointer' }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px' }}>

        {/* Filtres */}
        <div className="fadeUp" style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <input
            type="text" placeholder="🔍 Rechercher (nom, email, téléphone...)" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ flex:1, minWidth:200, padding:'11px 16px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, color:T.text, fontSize:14 }}
          />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            style={{ padding:'11px 16px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, color:T.text, fontSize:14, cursor:'pointer' }}>
            <option value="">Tous les rôles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={fetchUsers} style={{ padding:'11px 20px', background:T.accentBg, border:`1px solid ${T.accent}30`, borderRadius:12, color:T.accent, fontWeight:700, fontSize:14, cursor:'pointer' }}>↻ Actualiser</button>
        </div>

        {/* Stats rapides */}
        <div className="fadeUp" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
          {ROLES.map(role => {
            const count = users.filter(u => u.role === role).length;
            const [color, bg] = ROLE_COLORS[role];
            return (
              <div key={role} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'16px 20px' }}>
                <p style={{ margin:0, color:T.muted, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{role}</p>
                <p style={{ margin:'8px 0 0', color, fontSize:26, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="fadeUp" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden' }}>
          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 120px 100px 120px', gap:16, padding:'14px 24px', borderBottom:`1px solid ${T.border}`, background:T.surfaceAlt }}>
            {['Utilisateur','Email / Téléphone','Rôle','Statut','Actions'].map(h => (
              <span key={h} style={{ color:T.muted, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:40, textAlign:'center', color:T.muted }}>⏳ Chargement...</div>
          ) : users.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:T.muted }}>Aucun utilisateur trouvé.</div>
          ) : users.map((u, i) => (
            <div key={u.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 120px 100px 120px', gap:16, padding:'16px 24px', borderBottom:i<users.length-1?`1px solid ${T.border}`:'none', alignItems:'center', opacity:u.is_active?1:0.55 }}>

              {/* Utilisateur */}
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:T.accentBg, display:'flex', alignItems:'center', justifyContent:'center', color:T.accent, fontWeight:800, fontSize:14, flexShrink:0 }}>
                  {(u.first_name||u.email||'?')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ margin:0, color:T.text, fontWeight:600, fontSize:14 }}>{u.first_name||''} {u.last_name||''}</p>
                  <p style={{ margin:0, color:T.muted, fontSize:11 }}>ID #{u.id}</p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p style={{ margin:0, color:T.text, fontSize:13 }}>{u.email||'—'}</p>
                <p style={{ margin:0, color:T.muted, fontSize:12 }}>{u.phone||'—'}</p>
              </div>

              {/* Rôle — éditable */}
              {editingId === u.id ? (
                <select value={editRole} onChange={e => setEditRole(e.target.value)}
                  style={{ padding:'6px 8px', background:T.surfaceAlt, border:`1px solid ${T.accent}`, borderRadius:8, color:T.text, fontSize:13, cursor:'pointer' }}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <RoleBadge role={u.role} />
              )}

              {/* Statut */}
              <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, background:u.is_active?T.greenBg:T.redBg, color:u.is_active?T.green:T.red }}>
                {u.is_active ? '● Actif' : '○ Inactif'}
              </span>

              {/* Actions */}
              <div style={{ display:'flex', gap:6 }}>
                {editingId === u.id ? (
                  <>
                    <button onClick={() => handleRoleUpdate(u.id)} style={{ padding:'6px 10px', background:T.greenBg, border:`1px solid ${T.green}30`, borderRadius:8, color:T.green, fontSize:13, cursor:'pointer', fontWeight:600 }}>✓</button>
                    <button onClick={() => setEditingId(null)} style={{ padding:'6px 10px', background:T.redBg, border:`1px solid ${T.red}30`, borderRadius:8, color:T.red, fontSize:13, cursor:'pointer' }}>✕</button>
                  </>
                ) : (
                  <>
                    {u.id !== me?.id && (
                      <button onClick={() => { setEditingId(u.id); setEditRole(u.role); }} style={{ padding:'6px 10px', background:T.accentBg, border:`1px solid ${T.accent}30`, borderRadius:8, color:T.accent, fontSize:13, cursor:'pointer' }}>✏️</button>
                    )}
                    {u.id !== me?.id && (
                      <button onClick={() => handleToggleActive(u)} style={{ padding:'6px 10px', background:u.is_active?T.redBg:T.greenBg, border:`1px solid ${u.is_active?T.red:T.green}30`, borderRadius:8, color:u.is_active?T.red:T.green, fontSize:13, cursor:'pointer' }}>
                        {u.is_active ? '🚫' : '✅'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:24 }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ padding:'8px 16px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, color:T.muted, cursor:page===1?'not-allowed':'pointer', opacity:page===1?0.5:1 }}>← Préc.</button>
            <span style={{ padding:'8px 16px', color:T.text, fontSize:14 }}>Page {page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ padding:'8px 16px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, color:T.muted, cursor:page===totalPages?'not-allowed':'pointer', opacity:page===totalPages?0.5:1 }}>Suiv. →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUsers;
