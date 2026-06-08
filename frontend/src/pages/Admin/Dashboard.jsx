/**
 * Admin Dashboard — KitchenPulse
 * - Utilise ThemeContext (useTheme)
 * - SVG icons (pas d'emojis)
 * - Navbar bottom : Stats | Utilisateurs | Menu | Rapports
 * - Upload image via /api/dishes
 * - Rapports PDF + CSV
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate }   from 'react-router-dom';
import { useAuth }       from '../../context/AuthContext';
import { useTheme }      from '../../context/ThemeContext';
import API               from '../../api/axiosConfig';
import { toast }         from 'react-toastify';

// ── SVG Icons ─────────────────────────────────────────────────
const Icon = {
  stats: (c='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  users: (c='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  menu: (c='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  ),
  report: (c='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  logout: (c='currentColor') => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  sun: (c='currentColor') => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (c='currentColor') => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  plus: (c='currentColor') => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  edit: (c='currentColor') => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (c='currentColor') => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  upload: (c='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  pdf: (c='currentColor') => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  csv: (c='currentColor') => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  revenue: (c='currentColor') => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  order: (c='currentColor') => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  table: (c='currentColor') => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  ),
  dish: (c='currentColor') => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M2 12a10 10 0 1 0 20 0"/><path d="M12 2v4"/><path d="M12 12v4"/>
      <path d="M2 12h4"/><path d="M18 12h4"/>
    </svg>
  ),
  check: (c='currentColor') => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (c='currentColor') => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  search: (c='currentColor') => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  bar: (c='currentColor') => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
};

// ── Mini Bar Chart SVG ────────────────────────────────────────
const BarChart = ({ data, T }) => {
  if (!data || data.length === 0) return (
    <div style={{ textAlign:'center', padding:'40px 0', color:T.sub }}>Aucune donnée</div>
  );
  const max = Math.max(...data.map(d => d.chiffre_affaires || 0), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120, padding:'0 8px' }}>
      {data.map((d, i) => {
        const h = Math.max(4, ((d.chiffre_affaires || 0) / max) * 100);
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:10, color:T.sub }}>{Math.round((d.chiffre_affaires||0)/1000)}k</span>
            <div style={{ width:'100%', height:`${h}%`, background:T.accent, borderRadius:'4px 4px 0 0', opacity:0.85, minHeight:4 }} />
            <span style={{ fontSize:10, color:T.sub, whiteSpace:'nowrap' }}>
              {d.jour ? new Date(d.jour).toLocaleDateString('fr',{weekday:'short'}) : `J${i+1}`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Donut Chart SVG ───────────────────────────────────────────
const DonutChart = ({ segments, T }) => {
  const size = 120, cx = 60, cy = 60, r = 46, stroke = 20;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const COLORS = [T.accent, T.green, '#3b82f6', '#a855f7', '#ec4899'];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width={size} height={size}>
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ}
              style={{ transition:'stroke-dasharray 0.4s' }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy+5} textAnchor="middle" fill={T.text} fontSize="13" fontWeight="700">
          {total}
        </text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:10, height:10, borderRadius:2, background:COLORS[i%COLORS.length], flexShrink:0 }} />
            <span style={{ fontSize:12, color:T.sub }}>{seg.label}</span>
            <span style={{ fontSize:12, color:T.text, fontWeight:700, marginLeft:'auto' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
const TABS = [
  { id:'stats',   label:'Stats',        iconFn: Icon.stats  },
  { id:'users',   label:'Utilisateurs', iconFn: Icon.users  },
  { id:'menu',    label:'Menu',         iconFn: Icon.menu   },
  { id:'reports', label:'Rapports',     iconFn: Icon.report },
];

const ROLES = ['CLIENT','SERVEUR','CUISINIER','ADMIN'];

export default function AdminDashboard() {
  const { user, logout }   = useAuth();
  const { T, isDark, toggle } = useTheme();
  const navigate           = useNavigate();
  const [tab, setTab]      = useState('stats');

  // Stats
  const [stats, setStats]       = useState(null);
  const [weekly, setWeekly]     = useState([]);
  const [loadingStats, setLS]   = useState(true);

  // Users
  const [users, setUsers]       = useState([]);
  const [searchU, setSearchU]   = useState('');
  const [roleFilter, setRoleF]  = useState('');
  const [editingUser, setEditU] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [loadingU, setLU]       = useState(false);

  // Menu
  const [dishes, setDishes]     = useState([]);
  const [categories, setCats]   = useState([]);
  const [searchD, setSearchD]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editDish, setEditDish] = useState(null);
  const [loadingD, setLD]       = useState(false);
  const fileRef                  = useRef();
  const [form, setForm]         = useState({ name:'', description:'', price:'', category_id:'', prep_time_minutes:'', is_featured:false });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Rapports
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportData, setReportData]     = useState([]);
  const [loadingR, setLR]               = useState(false);

  // ── Chargement initial ──────────────────────────────────────
  useEffect(() => { if (tab === 'stats')   fetchStats();   }, [tab]);
  useEffect(() => { if (tab === 'users')   fetchUsers();   }, [tab]);
  useEffect(() => { if (tab === 'menu')    fetchDishes();  }, [tab]);
  useEffect(() => { if (tab === 'reports') fetchReport();  }, [tab, reportPeriod]);

  const fetchStats = async () => {
    setLS(true);
    try {
      const [sRes, wRes] = await Promise.all([
        API.get('/stats/dashboard'),
        API.get('/stats/weekly').catch(() => ({ data:[] })),
      ]);
      setStats(sRes.data.data || sRes.data);
      setWeekly(Array.isArray(wRes.data) ? wRes.data : []);
    } catch { toast.error('Erreur chargement stats'); }
    finally  { setLS(false); }
  };

  const fetchUsers = async () => {
    setLU(true);
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch { toast.error('Erreur chargement utilisateurs'); }
    finally  { setLU(false); }
  };

  const fetchDishes = async () => {
    setLD(true);
    try {
      const [dRes, cRes] = await Promise.all([
        API.get('/dishes?disponible=all'),
        API.get('/dishes/categories'),
      ]);
      setDishes(Array.isArray(dRes.data) ? dRes.data : []);
      setCats(Array.isArray(cRes.data)   ? cRes.data : []);
    } catch { toast.error('Erreur chargement menu'); }
    finally  { setLD(false); }
  };

  const fetchReport = async () => {
    setLR(true);
    try {
      const res = await API.get(`/stats/weekly`);
      setReportData(Array.isArray(res.data) ? res.data : []);
    } catch {}
    finally  { setLR(false); }
  };

  // ── Users CRUD ──────────────────────────────────────────────
  const handleRoleUpdate = async (id) => {
    try {
      await API.put(`/users/${id}`, { role: editRole });
      toast.success('Rôle mis à jour !');
      setEditU(null);
      fetchUsers();
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
  };

  const handleToggleActive = async (u) => {
    try {
      await API.put(`/users/${u.id}`, { is_active: u.is_active ? 0 : 1 });
      toast.success(u.is_active ? 'Désactivé' : 'Activé');
      fetchUsers();
    } catch { toast.error('Erreur'); }
  };

  const filteredUsers = users.filter(u => {
    const q = searchU.toLowerCase();
    const matchSearch = !q || `${u.first_name} ${u.last_name} ${u.email} ${u.phone}`.toLowerCase().includes(q);
    const matchRole   = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Menu CRUD ───────────────────────────────────────────────
  const openForm = (dish = null) => {
    if (dish) {
      setForm({ name:dish.name, description:dish.description, price:dish.price, category_id:dish.category_id, prep_time_minutes:dish.prep_time_minutes||'', is_featured:!!dish.is_featured });
      setImagePreview(dish.image_url || null);
      setEditDish(dish);
    } else {
      setForm({ name:'', description:'', price:'', category_id: categories[0]?.id||'', prep_time_minutes:'', is_featured:false });
      setImagePreview(null);
      setEditDish(null);
    }
    setImageFile(null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmitDish = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editDish) {
        await API.patch(`/dishes/${editDish.id}`, fd, { headers:{'Content-Type':'multipart/form-data'} });
        toast.success('Plat mis à jour !');
      } else {
        await API.post('/dishes', fd, { headers:{'Content-Type':'multipart/form-data'} });
        toast.success('Plat créé !');
      }
      setShowForm(false);
      fetchDishes();
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
  };

  const handleDeleteDish = async (id) => {
    if (!confirm('Désactiver ce plat ?')) return;
    try {
      await API.delete(`/dishes/${id}`);
      toast.success('Plat désactivé');
      fetchDishes();
    } catch { toast.error('Erreur'); }
  };

  // ── Rapports export ─────────────────────────────────────────
  const exportCSV = () => {
    if (!reportData.length) return toast.warn('Aucune donnée');
    const headers = ['Jour','Nb Commandes','Chiffre d\'affaires (FCFA)'];
    const rows = reportData.map(r => [r.jour, r.nb_commandes, r.chiffre_affaires]);
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type:'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `kitchenpulse_rapport_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV téléchargé !');
  };

  const exportPDF = () => {
    if (!reportData.length) return toast.warn('Aucune donnée');
    const rows = reportData.map(r =>
      `<tr><td>${r.jour}</td><td>${r.nb_commandes}</td><td>${Number(r.chiffre_affaires).toLocaleString()} FCFA</td></tr>`
    ).join('');
    const total = reportData.reduce((s,r) => s + Number(r.chiffre_affaires||0), 0);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Rapport KitchenPulse</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}
      h1{color:#F5A623;margin-bottom:4px}p{color:#666;margin-bottom:24px}
      table{width:100%;border-collapse:collapse}
      th{background:#F5A623;color:#fff;padding:10px 14px;text-align:left}
      td{padding:10px 14px;border-bottom:1px solid #eee}
      tfoot td{font-weight:bold;border-top:2px solid #F5A623}</style>
    </head><body>
      <h1>KitchenPulse — Rapport d'activité</h1>
      <p>Généré le ${new Date().toLocaleDateString('fr-FR')} · KEYCE Informatique Groupe 7</p>
      <table><thead><tr><th>Jour</th><th>Commandes</th><th>CA</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2">Total</td><td>${total.toLocaleString()} FCFA</td></tr></tfoot>
      </table></body></html>`;
    const w = window.open('','_blank');
    w.document.write(html); w.document.close();
    setTimeout(() => { w.print(); }, 500);
  };

  // ── Helpers style ───────────────────────────────────────────
  const card = { background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:24 };
  const roleColor = { ADMIN:T.red, CUISINIER:T.accent, SERVEUR:'#3b82f6', CLIENT:T.green };
  const roleBg    = { ADMIN:`${T.red}20`, CUISINIER:`${T.accent}20`, SERVEUR:'rgba(59,130,246,0.12)', CLIENT:`${T.green}20` };
  const btn = (bg, color, border='none') => ({
    padding:'9px 18px', borderRadius:10, background:bg, border, color,
    fontSize:13, fontWeight:700, cursor:'pointer', display:'flex',
    alignItems:'center', gap:6, transition:'opacity 0.15s',
  });

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'Outfit','Segoe UI',sans-serif", paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}
        input,select,textarea{outline:none;font-family:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .fu{animation:fadeUp 0.25s ease both;}
        button:hover{opacity:0.85;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
      `}</style>

      {/* ── Topbar ─────────────────────────────────────────── */}
      <div style={{ position:'sticky', top:0, zIndex:200, background:T.navBg, borderBottom:`1px solid ${T.border}`, height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="34" r="20" stroke={T.accent} strokeWidth="2.5"/>
            <path d="M20 14v8M20 22c0 3 2 4 2 7v9" stroke={T.accent} strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 14h6v5a3 3 0 0 1-6 0V14z" stroke={T.accent} strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M44 14v24M41 14c0 5 6 5 6 10s-6 5-6 10v8" stroke={T.accent} strokeWidth="2" strokeLinecap="round"/>
            <path d="M24 34h3l2-5 4 10 2-5h3" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontWeight:800, fontSize:18 }}>Kitchen<span style={{ color:T.accent }}>Pulse</span></span>
          <span style={{ padding:'2px 10px', borderRadius:20, background:`${T.accent}20`, color:T.accent, fontSize:11, fontWeight:700 }}>ADMIN</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:13, color:T.sub }}>
            {user?.first_name} {user?.last_name}
          </span>
          <button onClick={toggle} style={{ width:34, height:34, borderRadius:10, background:T.surface, border:`1px solid ${T.border}`, color:T.sub, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {isDark ? Icon.sun(T.sub) : Icon.moon(T.sub)}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ ...btn(`${T.red}20`, T.red, `1px solid ${T.red}30`), padding:'7px 14px' }}>
            {Icon.logout(T.red)}<span>Sortir</span>
          </button>
        </div>
      </div>

      {/* ── Contenu par onglet ──────────────────────────────── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>

        {/* ══ STATS ════════════════════════════════════════════ */}
        {tab === 'stats' && (
          <div className="fu">
            {loadingStats ? (
              <div style={{ textAlign:'center', padding:60, color:T.sub }}>Chargement…</div>
            ) : (
              <>
                {/* KPIs */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
                  {[
                    { icon:Icon.revenue, label:'Chiffre d\'affaires', value:`${Number(stats?.summary?.total_revenue||0).toLocaleString()} F`, color:T.green },
                    { icon:Icon.order,   label:'Commandes totales',   value:stats?.summary?.total_orders||0, color:T.accent },
                    { icon:Icon.dish,    label:'Ticket moyen',        value:`${Math.round(stats?.summary?.average_basket||0).toLocaleString()} F`, color:'#3b82f6' },
                    { icon:Icon.table,   label:'Stocks en alerte',    value:stats?.lowStocksWarning?.length||0, color:T.red },
                  ].map((k,i) => (
                    <div key={i} style={{ ...card, display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:46, height:46, borderRadius:12, background:`${k.color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {k.icon(k.color)}
                      </div>
                      <div>
                        <p style={{ margin:0, fontSize:11, color:T.sub, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{k.label}</p>
                        <p style={{ margin:'4px 0 0', fontSize:24, fontWeight:800, color:k.color }}>{k.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Graphiques */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                  {/* Bar chart CA 7j */}
                  <div style={card}>
                    <p style={{ margin:'0 0 16px', fontWeight:700, fontSize:15 }}>CA — 7 derniers jours</p>
                    <BarChart data={weekly} T={T} />
                  </div>
                  {/* Donut top plats */}
                  <div style={card}>
                    <p style={{ margin:'0 0 16px', fontWeight:700, fontSize:15 }}>Top plats notés</p>
                    {stats?.topRatedDishes?.length > 0 ? (
                      <DonutChart
                        segments={stats.topRatedDishes.map(d => ({ label:d.name, value:Number(d.nb_avis||0) }))}
                        T={T}
                      />
                    ) : <p style={{ color:T.sub, fontSize:13 }}>Aucun avis pour l'instant.</p>}
                  </div>
                </div>

                {/* Top plats table */}
                <div style={card}>
                  <p style={{ margin:'0 0 16px', fontWeight:700, fontSize:15 }}>Plats les mieux notés</p>
                  {(stats?.topRatedDishes||[]).map((d,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:i<(stats.topRatedDishes.length-1)?`1px solid ${T.border}`:'none' }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:`${T.accent}20`, display:'flex', alignItems:'center', justifyContent:'center', color:T.accent, fontWeight:800, fontSize:13 }}>#{i+1}</div>
                      <span style={{ flex:1, fontWeight:600 }}>{d.name}</span>
                      <span style={{ color:T.sub, fontSize:13 }}>{d.nb_avis} avis</span>
                      <span style={{ color:T.accent, fontWeight:700 }}>★ {Number(d.note_moyenne||0).toFixed(1)}</span>
                    </div>
                  ))}
                </div>

                {/* Stocks alerte */}
                {stats?.lowStocksWarning?.length > 0 && (
                  <div style={{ ...card, marginTop:16, border:`1px solid ${T.red}40` }}>
                    <p style={{ margin:'0 0 12px', fontWeight:700, fontSize:15, color:T.red }}>Stocks en alerte</p>
                    {stats.lowStocksWarning.map((s,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:i<stats.lowStocksWarning.length-1?`1px solid ${T.border}`:'none' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:T.red, flexShrink:0 }} />
                        <span style={{ flex:1, fontWeight:500 }}>{s.ingredient}</span>
                        <span style={{ color:T.red, fontWeight:700 }}>{s.quantity} {s.unit}</span>
                        <div style={{ width:80, height:5, background:T.border, borderRadius:3 }}>
                          <div style={{ width:`${Math.min(s.pct_restant,100)}%`, height:'100%', background:s.pct_restant<30?T.red:T.accent, borderRadius:3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ UTILISATEURS ═════════════════════════════════════ */}
        {tab === 'users' && (
          <div className="fu">
            {/* Filtres */}
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:200, display:'flex', alignItems:'center', gap:8, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'0 14px' }}>
                {Icon.search(T.sub)}
                <input value={searchU} onChange={e=>setSearchU(e.target.value)} placeholder="Rechercher…"
                  style={{ border:'none', background:'transparent', color:T.text, fontSize:14, width:'100%', padding:'10px 0' }} />
              </div>
              <select value={roleFilter} onChange={e=>setRoleF(e.target.value)}
                style={{ padding:'10px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, color:T.text, fontSize:13, cursor:'pointer' }}>
                <option value="">Tous les rôles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Stats rôles */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
              {ROLES.map(r => (
                <div key={r} style={{ ...card, padding:16, textAlign:'center' }}>
                  <p style={{ margin:0, fontSize:11, color:T.sub, fontWeight:600 }}>{r}</p>
                  <p style={{ margin:'6px 0 0', fontSize:22, fontWeight:800, color:roleColor[r] }}>
                    {users.filter(u=>u.role===r).length}
                  </p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 110px 90px 100px', padding:'12px 20px', background:T.surface, borderBottom:`1px solid ${T.border}` }}>
                {['Utilisateur','Contact','Rôle','Statut','Actions'].map(h => (
                  <span key={h} style={{ fontSize:11, fontWeight:700, color:T.sub, textTransform:'uppercase', letterSpacing:0.5 }}>{h}</span>
                ))}
              </div>
              {loadingU ? (
                <div style={{ padding:40, textAlign:'center', color:T.sub }}>Chargement…</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding:40, textAlign:'center', color:T.sub }}>Aucun utilisateur trouvé.</div>
              ) : filteredUsers.map((u,i) => (
                <div key={u.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 110px 90px 100px', padding:'14px 20px', borderBottom:i<filteredUsers.length-1?`1px solid ${T.border}`:'none', alignItems:'center', opacity:u.is_active?1:0.5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:`${T.accent}20`, display:'flex', alignItems:'center', justifyContent:'center', color:T.accent, fontWeight:800, fontSize:13, flexShrink:0 }}>
                      {(u.first_name||u.email||'?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin:0, fontWeight:600, fontSize:14 }}>{u.first_name} {u.last_name}</p>
                      <p style={{ margin:0, fontSize:11, color:T.sub }}>#{u.id}</p>
                    </div>
                  </div>
                  <div>
                    <p style={{ margin:0, fontSize:13 }}>{u.email||'—'}</p>
                    <p style={{ margin:0, fontSize:12, color:T.sub }}>{u.phone||'—'}</p>
                  </div>
                  {editingUser === u.id ? (
                    <select value={editRole} onChange={e=>setEditRole(e.target.value)}
                      style={{ padding:'5px 8px', background:T.surface, border:`1px solid ${T.accent}`, borderRadius:8, color:T.text, fontSize:12, cursor:'pointer' }}>
                      {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:roleBg[u.role], color:roleColor[u.role] }}>{u.role}</span>
                  )}
                  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:u.is_active?`${T.green}20`:`${T.red}20`, color:u.is_active?T.green:T.red }}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>
                  <div style={{ display:'flex', gap:5 }}>
                    {editingUser === u.id ? (
                      <>
                        <button onClick={()=>handleRoleUpdate(u.id)} style={{ width:30, height:30, borderRadius:8, background:`${T.green}20`, border:`1px solid ${T.green}30`, color:T.green, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Icon.check(T.green)}</button>
                        <button onClick={()=>setEditU(null)} style={{ width:30, height:30, borderRadius:8, background:`${T.red}20`, border:`1px solid ${T.red}30`, color:T.red, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Icon.x(T.red)}</button>
                      </>
                    ) : (
                      <>
                        {u.id !== user?.id && <button onClick={()=>{setEditU(u.id);setEditRole(u.role);}} style={{ width:30, height:30, borderRadius:8, background:`${T.accent}20`, border:`1px solid ${T.accent}30`, color:T.accent, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Icon.edit(T.accent)}</button>}
                        {u.id !== user?.id && <button onClick={()=>handleToggleActive(u)} style={{ width:30, height:30, borderRadius:8, background:u.is_active?`${T.red}20`:`${T.green}20`, border:`1px solid ${u.is_active?T.red:T.green}30`, color:u.is_active?T.red:T.green, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{u.is_active?Icon.trash(T.red):Icon.check(T.green)}</button>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ MENU ════════════════════════════════════════════ */}
        {tab === 'menu' && (
          <div className="fu">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'0 14px', flex:1, maxWidth:340 }}>
                  {Icon.search(T.sub)}
                  <input value={searchD} onChange={e=>setSearchD(e.target.value)} placeholder="Rechercher un plat…"
                    style={{ border:'none', background:'transparent', color:T.text, fontSize:14, width:'100%', padding:'10px 0' }} />
                </div>
              </div>
              <button onClick={()=>openForm()} style={{ ...btn(T.accent,'#fff'), padding:'10px 20px' }}>
                {Icon.plus('#fff')} Nouveau plat
              </button>
            </div>

            {/* Modal formulaire */}
            {showForm && (
              <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                    <h3 style={{ margin:0, fontWeight:800 }}>{editDish ? 'Modifier le plat' : 'Nouveau plat'}</h3>
                    <button onClick={()=>setShowForm(false)} style={{ width:32, height:32, borderRadius:8, background:T.card, border:`1px solid ${T.border}`, color:T.sub, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Icon.x(T.sub)}</button>
                  </div>
                  <form onSubmit={handleSubmitDish}>
                    {/* Image upload */}
                    <div style={{ marginBottom:16 }}>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.sub, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Photo du plat</label>
                      <div onClick={()=>fileRef.current?.click()} style={{ border:`2px dashed ${imagePreview?T.accent:T.border}`, borderRadius:12, padding:imagePreview?0:24, textAlign:'center', cursor:'pointer', overflow:'hidden', position:'relative' }}>
                        {imagePreview ? (
                          <img src={imagePreview.startsWith('blob')?imagePreview:`http://localhost:3001${imagePreview}`} alt="" style={{ width:'100%', height:160, objectFit:'cover', display:'block' }} />
                        ) : (
                          <div style={{ color:T.sub, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                            {Icon.upload(T.sub)}
                            <span style={{ fontSize:13 }}>Cliquer pour uploader (max 5 Mo)</span>
                          </div>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display:'none' }} />
                    </div>
                    {/* Champs */}
                    {[
                      { label:'Nom du plat *', key:'name', type:'text', placeholder:'Ex: Poulet braisé' },
                      { label:'Prix (FCFA) *', key:'price', type:'number', placeholder:'Ex: 3500' },
                      { label:'Temps de préparation (min)', key:'prep_time_minutes', type:'number', placeholder:'Ex: 20' },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom:14 }}>
                        <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.sub, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>{f.label}</label>
                        <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} required={f.label.includes('*')}
                          style={{ width:'100%', padding:'10px 14px', background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:14 }} />
                      </div>
                    ))}
                    <div style={{ marginBottom:14 }}>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.sub, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Catégorie *</label>
                      <select value={form.category_id} onChange={e=>setForm(p=>({...p,category_id:e.target.value}))} required
                        style={{ width:'100%', padding:'10px 14px', background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:14, cursor:'pointer' }}>
                        <option value="">Choisir…</option>
                        {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.sub, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Description *</label>
                      <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Description du plat…" rows={3} required
                        style={{ width:'100%', padding:'10px 14px', background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:14, resize:'vertical' }} />
                    </div>
                    <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom:20 }}>
                      <input type="checkbox" checked={form.is_featured} onChange={e=>setForm(p=>({...p,is_featured:e.target.checked}))} />
                      <span style={{ fontSize:14, color:T.sub }}>Mettre en avant (featured)</span>
                    </label>
                    <div style={{ display:'flex', gap:10 }}>
                      <button type="button" onClick={()=>setShowForm(false)} style={{ ...btn(T.card,T.sub,`1px solid ${T.border}`), flex:1, justifyContent:'center' }}>Annuler</button>
                      <button type="submit" style={{ ...btn(T.accent,'#fff'), flex:2, justifyContent:'center' }}>{editDish?'Mettre à jour':'Créer le plat'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Grille plats */}
            {loadingD ? (
              <div style={{ textAlign:'center', padding:60, color:T.sub }}>Chargement…</div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
                {dishes.filter(d=>!searchD||d.name.toLowerCase().includes(searchD.toLowerCase())).map(d => (
                  <div key={d.id} style={{ ...card, padding:0, overflow:'hidden', opacity:d.is_active?1:0.55 }}>
                    {d.image_url ? (
                      <img src={`http://localhost:3001${d.image_url}`} alt={d.name} style={{ width:'100%', height:140, objectFit:'cover', display:'block' }} />
                    ) : (
                      <div style={{ width:'100%', height:140, background:T.surface, display:'flex', alignItems:'center', justifyContent:'center', color:T.sub }}>
                        {Icon.dish(T.border)}
                      </div>
                    )}
                    <div style={{ padding:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <p style={{ margin:0, fontWeight:700, fontSize:15 }}>{d.name}</p>
                        <span style={{ color:T.accent, fontWeight:800, fontSize:15, flexShrink:0 }}>{Number(d.price).toLocaleString()} F</span>
                      </div>
                      <p style={{ margin:'0 0 12px', color:T.sub, fontSize:12, lineHeight:1.4 }}>{d.description?.slice(0,80)}{d.description?.length>80?'…':''}</p>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>openForm(d)} style={{ ...btn(`${T.accent}20`,T.accent,`1px solid ${T.accent}30`), flex:1, justifyContent:'center', padding:'7px 0', fontSize:12 }}>
                          {Icon.edit(T.accent)} Modifier
                        </button>
                        <button onClick={()=>handleDeleteDish(d.id)} style={{ ...btn(`${T.red}20`,T.red,`1px solid ${T.red}30`), padding:'7px 10px' }}>
                          {Icon.trash(T.red)}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ RAPPORTS ════════════════════════════════════════ */}
        {tab === 'reports' && (
          <div className="fu">
            <div style={{ ...card, marginBottom:20 }}>
              <p style={{ margin:'0 0 16px', fontWeight:700, fontSize:15 }}>Exporter les données</p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <button onClick={exportCSV} style={{ ...btn(`${T.green}20`, T.green, `1px solid ${T.green}30`), padding:'12px 24px', fontSize:14 }}>
                  {Icon.csv(T.green)} Télécharger CSV
                </button>
                <button onClick={exportPDF} style={{ ...btn(`${T.red}20`, T.red, `1px solid ${T.red}30`), padding:'12px 24px', fontSize:14 }}>
                  {Icon.pdf(T.red)} Générer PDF
                </button>
              </div>
            </div>

            <div style={card}>
              <p style={{ margin:'0 0 16px', fontWeight:700, fontSize:15 }}>Rapport — CA des 7 derniers jours</p>
              {loadingR ? (
                <div style={{ textAlign:'center', padding:40, color:T.sub }}>Chargement…</div>
              ) : reportData.length === 0 ? (
                <p style={{ color:T.sub }}>Aucune donnée disponible.</p>
              ) : (
                <>
                  <BarChart data={reportData} T={T} />
                  <div style={{ marginTop:20, border:`1px solid ${T.border}`, borderRadius:12, overflow:'hidden' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'10px 16px', background:T.surface, borderBottom:`1px solid ${T.border}` }}>
                      {['Jour','Commandes','CA (FCFA)'].map(h => (
                        <span key={h} style={{ fontSize:11, fontWeight:700, color:T.sub, textTransform:'uppercase' }}>{h}</span>
                      ))}
                    </div>
                    {reportData.map((r,i) => (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'10px 16px', borderBottom:i<reportData.length-1?`1px solid ${T.border}`:'none' }}>
                        <span style={{ fontSize:13 }}>{r.jour ? new Date(r.jour).toLocaleDateString('fr-FR') : `Jour ${i+1}`}</span>
                        <span style={{ fontSize:13 }}>{r.nb_commandes}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:T.accent }}>{Number(r.chiffre_affaires||0).toLocaleString()} F</span>
                      </div>
                    ))}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'12px 16px', background:`${T.accent}10`, borderTop:`2px solid ${T.accent}30` }}>
                      <span style={{ fontWeight:700 }}>Total</span>
                      <span style={{ fontWeight:700 }}>{reportData.reduce((s,r)=>s+Number(r.nb_commandes||0),0)}</span>
                      <span style={{ fontWeight:800, color:T.accent }}>{reportData.reduce((s,r)=>s+Number(r.chiffre_affaires||0),0).toLocaleString()} F</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Navbar ───────────────────────────────────── */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:T.navBg, borderTop:`1px solid ${T.border}`, display:'flex', padding:'8px 0 16px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 0', color:tab===t.id?T.accent:T.sub }}>
            {t.iconFn(tab===t.id?T.accent:T.sub)}
            <span style={{ fontSize:11, fontWeight:tab===t.id?700:400 }}>{t.label}</span>
            {tab === t.id && <span style={{ width:20, height:3, borderRadius:2, background:T.accent }} />}
          </button>
        ))}
      </div>
    </div>
  );
}