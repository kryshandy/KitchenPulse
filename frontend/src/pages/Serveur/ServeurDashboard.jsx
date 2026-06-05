import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosConfig';
import { toast } from 'react-toastify';

// ── Thème ─────────────────────────────────────────────────────
const LIGHT = {
  bg:'#F7F5F0', surface:'#FFFFFF', surfaceAlt:'#F0EDE8', border:'#E5E0D8',
  text:'#1A1714', muted:'#6B6560', hint:'#9E9890',
  accent:'#D4541A', accentBg:'#FEF1EB',
  green:'#1A7A52', greenBg:'#E8F5EE',
  amber:'#C2850A', amberBg:'#FEF7E6',
  blue:'#1D5FA8',  blueBg:'#E8F0FC',
  red:'#C0392B',   redBg:'#FDECEA',
  shadow:'0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
};
const DARK = {
  bg:'#0F0E0C', surface:'#1C1A17', surfaceAlt:'#242119', border:'#2E2B26',
  text:'#F0EDE8', muted:'#8A847A', hint:'#5A5650',
  accent:'#FF6B35', accentBg:'rgba(255,107,53,0.12)',
  green:'#00C896', greenBg:'rgba(0,200,150,0.12)',
  amber:'#FFB800', amberBg:'rgba(255,184,0,0.12)',
  blue:'#5B9CF6',  blueBg:'rgba(91,156,246,0.12)',
  red:'#EF4444',   redBg:'rgba(239,68,68,0.12)',
  shadow:'0 1px 4px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
};

const STATUS_COLORS = (T) => ({
  LIBRE:              { color:T.green,  bg:T.greenBg,  label:'Libre',        icon:'✅' },
  OCCUPEE:            { color:T.accent, bg:T.accentBg, label:'Occupée',      icon:'🔴' },
  EN_SERVICE:         { color:T.amber,  bg:T.amberBg,  label:'En service',   icon:'🍽️' },
  ADDITION_DEMANDEE:  { color:T.red,    bg:T.redBg,    label:'Addition !',   icon:'💳' },
  EN_NETTOYAGE:       { color:T.blue,   bg:T.blueBg,   label:'Nettoyage',    icon:'🧹' },
  RESERVEE:           { color:T.blue,   bg:T.blueBg,   label:'Réservée',     icon:'📅' },
});

// ── Composant carte de table ──────────────────────────────────
const TableCard = ({ table, onStatusChange, T }) => {
  const statusCfg = STATUS_COLORS(T)[table.status] || { color:T.muted, bg:T.surfaceAlt, label:table.status, icon:'❓' };
  const isUrgent  = table.status === 'ADDITION_DEMANDEE';

  return (
    <div style={{
      background:T.surface, border:`2px solid ${isUrgent ? statusCfg.color : T.border}`,
      borderRadius:16, padding:18, boxShadow:isUrgent?`0 0 16px ${statusCfg.color}40`:T.shadow,
      transition:'all 0.25s',
    }}>
      {/* En-tête */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:statusCfg.color }}>
          Table {table.table_number}
        </span>
        <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:statusCfg.bg, color:statusCfg.color }}>
          {statusCfg.icon} {statusCfg.label}
        </span>
      </div>

      {/* Infos */}
      <div style={{ marginBottom:14, fontSize:13, color:T.muted }}>
        <p style={{ margin:'0 0 4px' }}>👥 Capacité : {table.capacity} pers. {table.area ? `• ${table.area}` : ''}</p>
        {table.client_name && <p style={{ margin:'0 0 4px', color:T.text, fontWeight:600 }}>👤 {table.first_name} {table.last_name}</p>}
        {table.order_number && <p style={{ margin:0 }}>🧾 Commande {table.order_number} • {Number(table.total_amount||0).toLocaleString()} FCFA</p>}
      </div>

      {/* Actions rapides */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {table.status === 'LIBRE' && (
          <ActionBtn label="🟠 Ouvrir" color={T.accent} bg={T.accentBg} onClick={() => onStatusChange(table.id, 'OCCUPEE')} />
        )}
        {table.status === 'OCCUPEE' && (
          <ActionBtn label="🍽️ En service" color={T.amber} bg={T.amberBg} onClick={() => onStatusChange(table.id, 'EN_SERVICE')} />
        )}
        {['OCCUPEE','EN_SERVICE','ADDITION_DEMANDEE'].includes(table.status) && (
          <ActionBtn label="✅ Libérer" color={T.green} bg={T.greenBg} onClick={() => onStatusChange(table.id, 'EN_NETTOYAGE')} />
        )}
        {table.status === 'EN_NETTOYAGE' && (
          <ActionBtn label="✅ Prête" color={T.green} bg={T.greenBg} onClick={() => onStatusChange(table.id, 'LIBRE')} />
        )}
      </div>
    </div>
  );
};

const ActionBtn = ({ label, color, bg, onClick }) => (
  <button onClick={onClick} style={{ padding:'7px 12px', borderRadius:10, border:`1px solid ${color}30`, background:bg, color, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}>
    {label}
  </button>
);

// ── Composant notifications ───────────────────────────────────
const NotifPanel = ({ notifs, onRead, T }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden' }}>
    {notifs.length === 0 ? (
      <div style={{ padding:40, textAlign:'center', color:T.muted }}>
        <div style={{ fontSize:36, marginBottom:8 }}>🔔</div>
        <p style={{ margin:0 }}>Aucune notification</p>
      </div>
    ) : notifs.map((n, i) => (
      <div key={n.id} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 20px', borderBottom:i<notifs.length-1?`1px solid ${T.border}`:'none', background:n.is_read?'transparent':T.accentBg, cursor:'pointer' }}
        onClick={() => !n.is_read && onRead(n.id)}>
        <span style={{ fontSize:22, flexShrink:0 }}>
          {n.type==='ORDER_READY'?'🍽️':n.type==='BILL_REQUESTED'?'💳':n.type==='STOCK_ALERT'?'⚠️':'🔔'}
        </span>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, color:T.text, fontWeight:n.is_read?500:700, fontSize:14 }}>{n.title || n.type}</p>
          <p style={{ margin:'4px 0 0', color:T.muted, fontSize:12 }}>{new Date(n.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</p>
        </div>
        {!n.is_read && <span style={{ width:8, height:8, borderRadius:'50%', background:T.accent, flexShrink:0, marginTop:6 }} />}
      </div>
    ))}
  </div>
);

// ── Dashboard Serveur ─────────────────────────────────────────
const ServeurDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const T = darkMode ? DARK : LIGHT;
  const [page, setPage]     = useState('tables');
  const [tables, setTables] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const unreadCount = notifs.filter(n => !n.is_read).length;

  const fetchTables = useCallback(async () => {
    try {
      const res = await API.get('/tables');
      setTables(res.data);
    } catch { toast.error('Erreur chargement tables'); }
    finally { setLoading(false); }
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await API.get('/notifications');
      setNotifs(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTables();
    fetchNotifs();
    const interval = setInterval(() => { fetchTables(); fetchNotifs(); }, 10000);
    return () => clearInterval(interval);
  }, [fetchTables, fetchNotifs]);

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await API.patch(`/tables/${tableId}/status`, { status: newStatus });
      toast.success('Statut mis à jour !');
      fetchTables();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleReadNotif = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      fetchNotifs();
    } catch {}
  };

  const displayed = filterStatus ? tables.filter(t => t.status === filterStatus) : tables;
  const stats = {
    libres:   tables.filter(t => t.status === 'LIBRE').length,
    occupees: tables.filter(t => !['LIBRE','EN_NETTOYAGE'].includes(t.status)).length,
    addition: tables.filter(t => t.status === 'ADDITION_DEMANDEE').length,
  };

  const navItems = [
    { id:'tables', icon:'🪑', label:'Tables' },
    { id:'notifs', icon:'🔔', label:'Notifs', badge:unreadCount },
  ];

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:"'Segoe UI',sans-serif", color:T.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        .fadeUp{animation:fadeUp 0.3s ease both;}
      `}</style>

      {/* Topbar */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18 }}>
            Kitchen<span style={{ color:T.accent }}>Pulse</span>
          </span>
          <span style={{ background:T.blueBg, color:T.blue, border:`1px solid ${T.blue}30`, padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:700 }}>SERVEUR</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:T.green, animation:'pulse 1.8s infinite', display:'inline-block' }} />
          <span style={{ fontSize:12, color:T.muted }}>Live</span>
          <button onClick={() => setDarkMode(d => !d)} style={{ width:34, height:34, borderRadius:10, background:T.surfaceAlt, border:`1px solid ${T.border}`, cursor:'pointer', fontSize:16 }}>{darkMode ? '☀️' : '🌙'}</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ padding:'6px 12px', background:T.redBg, border:`1px solid ${T.red}30`, borderRadius:10, color:T.red, fontSize:12, fontWeight:600, cursor:'pointer' }}>Sortir</button>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, borderBottom:`1px solid ${T.border}`, background:T.border }}>
        {[
          { label:'Libres', value:stats.libres, color:T.green },
          { label:'Occupées', value:stats.occupees, color:T.accent },
          { label:'Addition !', value:stats.addition, color:T.red },
        ].map(s => (
          <div key={s.label} style={{ background:T.surface, padding:'12px 0', textAlign:'center' }}>
            <p style={{ margin:0, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:s.color }}>{s.value}</p>
            <p style={{ margin:'2px 0 0', fontSize:11, color:T.muted }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div style={{ padding:'20px 16px 80px' }}>

        {page === 'tables' && (
          <div className="fadeUp">
            {/* Filtres statut */}
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:20, scrollbarWidth:'none' }}>
              {[{v:'',l:'Toutes'},{v:'LIBRE',l:'🟢 Libres'},{v:'OCCUPEE',l:'🔴 Occupées'},{v:'EN_SERVICE',l:'🍽️ Service'},{v:'ADDITION_DEMANDEE',l:'💳 Addition'},{v:'EN_NETTOYAGE',l:'🧹 Nettoyage'}].map(f => (
                <button key={f.v} onClick={() => setFilterStatus(f.v)} style={{ padding:'7px 14px', borderRadius:20, whiteSpace:'nowrap', border:`1px solid ${filterStatus===f.v?T.accent:T.border}`, background:filterStatus===f.v?T.accentBg:'transparent', color:filterStatus===f.v?T.accent:T.muted, fontSize:13, fontWeight:filterStatus===f.v?700:400, cursor:'pointer', transition:'all 0.2s' }}>
                  {f.l}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign:'center', padding:40, color:T.muted }}>⏳ Chargement des tables...</div>
            ) : displayed.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:T.muted }}>
                <div style={{ fontSize:40, marginBottom:8 }}>🪑</div>
                <p>Aucune table dans ce statut.</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
                {displayed.map(t => <TableCard key={t.id} table={t} onStatusChange={handleStatusChange} T={T} />)}
              </div>
            )}
          </div>
        )}

        {page === 'notifs' && (
          <div className="fadeUp">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ margin:0, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20 }}>Notifications</h2>
              {unreadCount > 0 && (
                <button onClick={async () => { try { await API.patch('/notifications/read-all'); fetchNotifs(); toast.success('Tout marqué comme lu'); } catch {} }}
                  style={{ padding:'8px 14px', background:T.accentBg, border:`1px solid ${T.accent}30`, borderRadius:10, color:T.accent, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Tout marquer lu ({unreadCount})
                </button>
              )}
            </div>
            <NotifPanel notifs={notifs} onRead={handleReadNotif} T={T} />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:T.surface, borderTop:`1px solid ${T.border}`, display:'flex', padding:'8px 0 16px' }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 0', color:page===item.id?T.accent:T.muted, position:'relative' }}>
            <span style={{ fontSize:22 }}>{item.icon}</span>
            <span style={{ fontSize:11, fontWeight:page===item.id?700:400 }}>{item.label}</span>
            {item.badge > 0 && (
              <span style={{ position:'absolute', top:2, right:'calc(50% - 20px)', background:T.red, color:'#fff', fontSize:10, fontWeight:800, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{item.badge}</span>
            )}
            {page === item.id && <span style={{ width:20, height:3, borderRadius:2, background:T.accent }} />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServeurDashboard;
