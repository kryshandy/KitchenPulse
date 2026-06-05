import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosConfig';
import { toast } from 'react-toastify';

// ── Thème ─────────────────────────────────────────────────────
const T = {
  bg:'#0f172a', surface:'#1e293b', surfaceAlt:'#263148',
  border:'#334155', text:'#f1f5f9', muted:'#94a3b8', hint:'#64748b',
  accent:'#f97316', accentBg:'rgba(249,115,22,0.12)',
  green:'#10b981', greenBg:'rgba(16,185,129,0.12)',
  amber:'#f59e0b', amberBg:'rgba(245,158,11,0.12)',
  blue:'#3b82f6',  blueBg:'rgba(59,130,246,0.12)',
  red:'#ef4444',   redBg:'rgba(239,68,68,0.12)',
};

// ── Composants ────────────────────────────────────────────────
const KPICard = ({ icon, label, value, sub, color, bg }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:24, display:'flex', alignItems:'flex-start', gap:16 }}>
    <div style={{ width:52, height:52, borderRadius:14, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{icon}</div>
    <div>
      <p style={{ margin:0, color:T.muted, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{label}</p>
      <p style={{ margin:'6px 0 4px', color, fontSize:28, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>{value}</p>
      {sub && <p style={{ margin:0, color:T.hint, fontSize:12 }}>{sub}</p>}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 style={{ color:T.text, fontSize:18, fontWeight:700, margin:'32px 0 16px', fontFamily:"'Syne',sans-serif" }}>{children}</h2>
);

// ── Page principale ───────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [topDishes, setTopDishes] = useState([]);
  const [stocks, setStocks]     = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [sRes, dRes, stRes, uRes] = await Promise.all([
        API.get('/stats/today'),
        API.get('/stats/top-dishes?limit=5'),
        API.get('/stats/stocks'),
        API.get('/users?limit=5'),
      ]);
      setStats(sRes.data);
      setTopDishes(dRes.data);
      setStocks(stRes.data);
      setUsers(uRes.data.users || uRes.data);
    } catch (err) {
      toast.error('Erreur chargement données');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tabs = [
    { id:'dashboard', label:'Dashboard', icon:'📊' },
    { id:'users',     label:'Équipe',    icon:'👥' },
    { id:'menu',      label:'Menu',      icon:'🍽️' },
    { id:'orders',    label:'Commandes', icon:'📦' },
  ];

  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:T.muted }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⏳</div>
        <p>Chargement du dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:"'Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#334155;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .fadeUp{animation:fadeUp 0.3s ease both;}
      `}</style>

      {/* Topbar */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, background:T.accent, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:13 }}>KP</div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:T.text }}>
            Kitchen<span style={{ color:T.accent }}>Pulse</span>
          </span>
          <span style={{ background:T.accentBg, color:T.accent, border:`1px solid ${T.accent}30`, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>ADMIN</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ color:T.muted, fontSize:14 }}>👋 {user?.first_name || user?.nom || 'Admin'}</span>
          <button onClick={handleLogout} style={{ padding:'8px 16px', background:T.redBg, border:`1px solid ${T.red}30`, borderRadius:10, color:T.red, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ display:'flex' }}>
        {/* Sidebar */}
        <div style={{ width:220, background:T.surface, borderRight:`1px solid ${T.border}`, minHeight:'calc(100vh - 64px)', padding:'24px 12px', position:'sticky', top:64, alignSelf:'flex-start' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if(tab.id==='users') navigate('/admin/users'); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, border:'none', background:activeTab===tab.id?T.accentBg:'transparent', color:activeTab===tab.id?T.accent:T.muted, fontSize:14, fontWeight:activeTab===tab.id?700:500, cursor:'pointer', marginBottom:4, transition:'all 0.2s', textAlign:'left' }}>
              <span style={{ fontSize:18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex:1, padding:'32px 40px' }}>

          {/* KPIs */}
          <div className="fadeUp" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:8 }}>
            <KPICard icon="💰" label="CA aujourd'hui" value={`${(stats?.chiffre_affaires||0).toLocaleString()} F`} sub={`${stats?.nb_commandes||0} commandes`} color={T.green} bg={T.greenBg} />
            <KPICard icon="🧾" label="Ticket moyen"   value={`${Math.round(stats?.ticket_moyen||0).toLocaleString()} F`} color={T.accent} bg={T.accentBg} />
            <KPICard icon="🪑" label="Tables occupées" value={`${stats?.tables_occupees||0}/${stats?.total_tables||0}`} sub={`${stats?.tables_libres||0} libres`} color={T.amber} bg={T.amberBg} />
            <KPICard icon="📦" label="Commandes actives" value={stats?.commandes_actives||0} color={T.blue} bg={T.blueBg} />
          </div>

          {/* Top plats */}
          <SectionTitle>🏆 Top plats du moment</SectionTitle>
          <div className="fadeUp" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden' }}>
            {topDishes.length === 0 ? (
              <p style={{ padding:24, color:T.muted, textAlign:'center' }}>Aucune donnée disponible.</p>
            ) : topDishes.map((dish, i) => (
              <div key={dish.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 24px', borderBottom:i<topDishes.length-1?`1px solid ${T.border}`:'none' }}>
                <span style={{ width:28, height:28, borderRadius:8, background:i===0?T.amberBg:T.surfaceAlt, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:i===0?T.amber:T.muted, flexShrink:0 }}>#{i+1}</span>
                <span style={{ flex:1, color:T.text, fontWeight:600, fontSize:15 }}>{dish.name}</span>
                <span style={{ color:T.muted, fontSize:13 }}>{dish.total_commande} commandes</span>
                <span style={{ color:T.accent, fontWeight:700, fontSize:14 }}>{Number(dish.revenu_total||0).toLocaleString()} F</span>
              </div>
            ))}
          </div>

          {/* Stocks en alerte */}
          {stocks.length > 0 && (
            <>
              <SectionTitle>⚠️ Stocks en alerte ({stocks.length})</SectionTitle>
              <div className="fadeUp" style={{ background:T.surface, border:`1px solid ${T.red}30`, borderRadius:16, overflow:'hidden' }}>
                {stocks.map((s, i) => (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 24px', borderBottom:i<stocks.length-1?`1px solid ${T.border}`:'none' }}>
                    <span style={{ fontSize:20 }}>🔴</span>
                    <span style={{ flex:1, color:T.text, fontWeight:600 }}>{s.ingredient}</span>
                    <span style={{ color:T.red, fontWeight:700 }}>{s.quantity} {s.unit}</span>
                    <span style={{ color:T.muted, fontSize:12 }}>seuil: {s.alert_threshold} {s.unit}</span>
                    <div style={{ width:80, height:6, background:T.border, borderRadius:3 }}>
                      <div style={{ width:`${Math.min(s.pct_restant,100)}%`, height:'100%', background:s.pct_restant<30?T.red:T.amber, borderRadius:3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Derniers utilisateurs */}
          <SectionTitle>👥 Derniers membres enregistrés</SectionTitle>
          <div className="fadeUp" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden' }}>
            {users.map((u, i) => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 24px', borderBottom:i<users.length-1?`1px solid ${T.border}`:'none' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:T.accentBg, display:'flex', alignItems:'center', justifyContent:'center', color:T.accent, fontWeight:700, fontSize:14, flexShrink:0 }}>
                  {(u.first_name||u.email||'?')[0].toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, color:T.text, fontWeight:600, fontSize:14 }}>{u.first_name} {u.last_name}</p>
                  <p style={{ margin:0, color:T.muted, fontSize:12 }}>{u.email}</p>
                </div>
                <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700,
                  background:u.role==='ADMIN'?T.redBg:u.role==='CUISINIER'?T.amberBg:u.role==='SERVEUR'?T.blueBg:T.greenBg,
                  color:u.role==='ADMIN'?T.red:u.role==='CUISINIER'?T.amber:u.role==='SERVEUR'?T.blue:T.green }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
