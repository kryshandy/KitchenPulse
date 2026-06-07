// frontend/src/pages/Serveur/ServeurDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axiosConfig';

const font = "'DM Sans','Segoe UI',sans-serif";

// ─── Icônes SVG ───────────────────────────────────────────────
const Ic = {
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  table: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg>,
  history: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  deliver: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  chair: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v10"/><path d="M18 3v10"/><path d="M6 13h12"/><path d="M8 21l2-8"/><path d="M16 21l-2-8"/></svg>,
  users: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  receipt: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/><line x1="16" y1="16" x2="10" y2="16"/></svg>,
  food: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  assign: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
};

// ─── Toast inline ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, success: m => add(m, 'success'), error: m => add(m, 'error'), warn: m => add(m, 'warn') };
}

function ToastContainer({ toasts, T }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? T.red : t.type === 'warn' ? T.accent : T.green,
          color: '#fff', padding: '10px 16px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,.3)',
          animation: 'fadeUp .25s ease', maxWidth: 300,
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

// ─── Config statuts table ──────────────────────────────────────
const TABLE_STATUS = (T) => ({
  LIBRE:             { label: 'Libre',       color: T.green,  bg: `${T.green}20`  },
  OCCUPEE:           { label: 'Occupée',     color: T.accent, bg: `${T.accent}20` },
  EN_SERVICE:        { label: 'En service',  color: '#F0A500', bg: 'rgba(240,165,0,.15)' },
  ADDITION_DEMANDEE: { label: 'Addition !',  color: T.red,    bg: `${T.red}20`    },
  EN_NETTOYAGE:      { label: 'Nettoyage',   color: T.sub,    bg: `${T.border}`   },
  RESERVEE:          { label: 'Réservée',    color: '#5B9CF6', bg: 'rgba(91,156,246,.15)' },
});

// ─── Config statuts commande ───────────────────────────────────
const ORDER_STATUS = (T) => ({
  RECUE:          { label: 'Reçue',         color: T.accent,  bg: `${T.accent}20`  },
  EN_PREPARATION: { label: 'En cuisine',    color: '#F0A500', bg: 'rgba(240,165,0,.15)' },
  PRETE:          { label: 'Prête ✓',       color: T.green,   bg: `${T.green}20`   },
  EN_COURS_DE_SERVICE: { label: 'En livraison', color: '#5B9CF6', bg: 'rgba(91,156,246,.15)' },
  SERVIE:         { label: 'Servie',        color: T.sub,     bg: T.surface        },
  CLOTUREE:       { label: 'Clôturée',      color: T.muted,   bg: T.surface        },
  ANNULEE:        { label: 'Annulée',       color: T.red,     bg: `${T.red}20`     },
});

// ─── Btn générique ────────────────────────────────────────────
const Btn = ({ children, onClick, color, bg, border, full, size = 'md', disabled }) => (
  <button onClick={disabled ? undefined : onClick} style={{
    padding: size === 'sm' ? '7px 12px' : '10px 16px',
    borderRadius: 10, border: `1px solid ${border || color + '40'}`,
    background: bg, color, fontSize: size === 'sm' ? 12 : 13,
    fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    width: full ? '100%' : undefined, justifyContent: full ? 'center' : undefined,
    opacity: disabled ? .5 : 1, fontFamily: font,
  }}>{children}</button>
);

// ─── TAG ──────────────────────────────────────────────────────
const Tag = ({ children, color, bg }) => (
  <span style={{ background: bg, color, border: `1px solid ${color}40`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
    {children}
  </span>
);

// ═══════════════════════════════════════════════════════════════
// ONGLET 1 — NOTIFICATIONS (commandes PRETE à assigner)
// ═══════════════════════════════════════════════════════════════
const Notifications = ({ toast, T }) => {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [assigning,  setAssigning]  = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/orders?status=PRETE');
      setOrders(data);
    } catch { if (!silent) toast.error('Impossible de charger les commandes prêtes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 8000);
    return () => clearInterval(id);
  }, [load]);

  const assign = async (orderId) => {
    setAssigning(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'EN_COURS_DE_SERVICE' });
      toast.success('Commande assignée — en route !');
      load(true);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setAssigning(null); }
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: T.muted }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
      Chargement…
    </div>
  );

  return (
    <div style={{ padding: '16px 16px 90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 2 }}>Commandes prêtes</h2>
          <p style={{ fontSize: 12, color: T.muted }}>
            {orders.length === 0 ? 'Aucune commande en attente' : `${orders.length} commande(s) à récupérer en cuisine`}
          </p>
        </div>
        <button onClick={() => load(true)} style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.sub, borderRadius: 9, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: font }}>
          {Ic.refresh} Actualiser
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted }}>
          <div style={{ color: T.border, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            {Ic.food}
          </div>
          <p style={{ fontSize: 14 }}>Aucune commande prête pour le moment</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>La cuisine vous notifiera dès qu'un plat est prêt</p>
        </div>
      ) : (
        orders.map(order => {
          const cfg = ORDER_STATUS(T)['PRETE'];
          return (
            <div key={order.id} style={{
              background: T.card, border: `1.5px solid ${T.green}`,
              borderLeft: `4px solid ${T.green}`, borderRadius: 14,
              padding: 16, marginBottom: 12,
              boxShadow: `0 0 12px ${T.green}20`,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 17, color: T.green }}>
                  #{order.order_number || order.id}
                </span>
                <Tag color={T.green} bg={`${T.green}20`}>Prête ✓</Tag>
              </div>

              {/* Méta */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: T.sub, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Ic.table} Table {order.table_numero ?? order.table_number ?? order.table_id}
                </span>
                <span style={{ fontSize: 12, color: T.sub, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Ic.users} {order.first_name || 'Client'}
                </span>
              </div>

              {/* Items */}
              <div style={{ background: T.surface, borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                {(order.items || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: i < order.items.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <span style={{ background: `${T.accent}20`, color: T.accent, fontWeight: 700, fontSize: 11, minWidth: 24, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×{item.quantity}
                    </span>
                    <span style={{ fontSize: 13, color: T.text }}>{item.plat_nom || item.name}</span>
                  </div>
                ))}
              </div>

              <Btn
                full color="#0A0C10" bg={T.green} border={T.green}
                onClick={() => assign(order.id)}
                disabled={assigning === order.id}
              >
                {Ic.assign} {assigning === order.id ? 'Assignation…' : 'Je prends en charge'}
              </Btn>
            </div>
          );
        })
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ONGLET 2 — MES LIVRAISONS (commandes EN_COURS_DE_SERVICE)
// ═══════════════════════════════════════════════════════════════
const MesLivraisons = ({ toast, T }) => {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [confirming, setConfirming] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/orders?status=EN_COURS_DE_SERVICE');
      setOrders(data);
    } catch { if (!silent) toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 8000);
    return () => clearInterval(id);
  }, [load]);

  const confirmer = async (orderId) => {
    setConfirming(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'SERVIE' });
      toast.success('Livraison confirmée !');
      load(true);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setConfirming(null); }
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: T.muted }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
      Chargement…
    </div>
  );

  return (
    <div style={{ padding: '16px 16px 90px' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 2 }}>Mes livraisons</h2>
        <p style={{ fontSize: 12, color: T.muted }}>
          {orders.length === 0 ? 'Aucune livraison en cours' : `${orders.length} commande(s) à livrer`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted }}>
          <div style={{ color: T.border, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            {Ic.deliver}
          </div>
          <p style={{ fontSize: 14 }}>Aucune livraison assignée</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{
            background: T.card, border: `1.5px solid #5B9CF6`,
            borderLeft: `4px solid #5B9CF6`, borderRadius: 14,
            padding: 16, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 17, color: '#5B9CF6' }}>
                #{order.order_number || order.id}
              </span>
              <Tag color="#5B9CF6" bg="rgba(91,156,246,.15)">En livraison</Tag>
            </div>

            <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: T.sub, display: 'flex', alignItems: 'center', gap: 4 }}>
                {Ic.table} Table {order.table_numero ?? order.table_number ?? order.table_id}
              </span>
              <span style={{ fontSize: 12, color: T.sub, display: 'flex', alignItems: 'center', gap: 4 }}>
                {Ic.receipt} {Number(order.total_amount || 0).toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            <div style={{ background: T.surface, borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
              {(order.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: i < order.items.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <span style={{ background: `${T.accent}20`, color: T.accent, fontWeight: 700, fontSize: 11, minWidth: 24, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ×{item.quantity}
                  </span>
                  <span style={{ fontSize: 13, color: T.text }}>{item.plat_nom || item.name}</span>
                </div>
              ))}
            </div>

            <Btn
              full color="#0A0C10" bg="#5B9CF6" border="#5B9CF6"
              onClick={() => confirmer(order.id)}
              disabled={confirming === order.id}
            >
              {Ic.check} {confirming === order.id ? 'Confirmation…' : 'Confirmer la livraison'}
            </Btn>
          </div>
        ))
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ONGLET 3 — TABLES
// ═══════════════════════════════════════════════════════════════
const Tables = ({ toast, T }) => {
  const [tables,  setTables]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/tables');
      setTables(data);
    } catch { toast.error('Erreur chargement tables'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, [load]);

  const changeStatus = async (tableId, status) => {
    try {
      await api.patch(`/tables/${tableId}/status`, { status });
      toast.success('Statut mis à jour');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
  };

  const SC = TABLE_STATUS(T);
  const displayed = filter ? tables.filter(t => t.status === filter) : tables;

  const stats = [
    { label: 'Libres',    v: tables.filter(t => t.status === 'LIBRE').length,             color: T.green  },
    { label: 'Occupées',  v: tables.filter(t => t.status === 'OCCUPEE').length,            color: T.accent },
    { label: 'Addition',  v: tables.filter(t => t.status === 'ADDITION_DEMANDEE').length,  color: T.red    },
  ];

  const FILTERS = [
    { v: '',                   l: 'Toutes'    },
    { v: 'LIBRE',              l: 'Libres'    },
    { v: 'OCCUPEE',            l: 'Occupées'  },
    { v: 'EN_SERVICE',         l: 'En service'},
    { v: 'ADDITION_DEMANDEE',  l: 'Addition'  },
    { v: 'EN_NETTOYAGE',       l: 'Nettoyage' },
  ];

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: T.muted }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
      Chargement des tables…
    </div>
  );

  return (
    <div style={{ padding: '16px 16px 90px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 14, scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12,
            fontWeight: filter === f.v ? 600 : 400, fontFamily: font,
            border: `1.5px solid ${filter === f.v ? T.accent : T.border}`,
            background: filter === f.v ? `${T.accent}20` : 'transparent',
            color: filter === f.v ? T.accent : T.muted,
          }}>{f.l}</button>
        ))}
      </div>

      {/* Grille tables */}
      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: T.border }}>{Ic.chair}</div>
          <p>Aucune table dans ce statut</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {displayed.map(table => {
            const cfg    = SC[table.status] || { label: table.status, color: T.muted, bg: T.surface };
            const urgent = table.status === 'ADDITION_DEMANDEE';
            return (
              <div key={table.id} style={{
                background: T.card, border: `1.5px solid ${urgent ? cfg.color : T.border}`,
                borderRadius: 14, padding: 14,
                boxShadow: urgent ? `0 0 14px ${cfg.color}30` : 'none',
                transition: 'all .2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: cfg.color }}>
                    T{table.table_number}
                  </span>
                  <Tag color={cfg.color} bg={cfg.bg}>{cfg.label}</Tag>
                </div>

                <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    {Ic.users} {table.capacity} pers.{table.area ? ` · ${table.area}` : ''}
                  </span>
                  {table.order_number && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Ic.receipt} #{table.order_number}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {table.status === 'LIBRE' && (
                    <Btn size="sm" color={T.accent} bg={`${T.accent}20`} onClick={() => changeStatus(table.id, 'OCCUPEE')}>
                      Ouvrir
                    </Btn>
                  )}
                  {table.status === 'OCCUPEE' && (
                    <Btn size="sm" color="#F0A500" bg="rgba(240,165,0,.15)" onClick={() => changeStatus(table.id, 'EN_SERVICE')}>
                      En service
                    </Btn>
                  )}
                  {['OCCUPEE', 'EN_SERVICE', 'ADDITION_DEMANDEE'].includes(table.status) && (
                    <Btn size="sm" color={T.green} bg={`${T.green}20`} onClick={() => changeStatus(table.id, 'EN_NETTOYAGE')}>
                      Libérer
                    </Btn>
                  )}
                  {table.status === 'EN_NETTOYAGE' && (
                    <Btn size="sm" color={T.green} bg={`${T.green}20`} onClick={() => changeStatus(table.id, 'LIBRE')}>
                      {Ic.check} Prête
                    </Btn>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ONGLET 4 — HISTORIQUE
// ═══════════════════════════════════════════════════════════════
const Historique = ({ toast, T }) => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch { toast.error('Erreur chargement historique'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const OS = ORDER_STATUS(T);
  const HIST_FILTERS = [
    { v: '',               l: 'Toutes'       },
    { v: 'EN_PREPARATION', l: 'En cuisine'   },
    { v: 'PRETE',          l: 'Prêtes'       },
    { v: 'SERVIE',         l: 'Servies'      },
    { v: 'CLOTUREE',       l: 'Clôturées'    },
  ];

  const displayed = filter ? orders.filter(o => o.status === filter) : orders;

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: T.muted }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
      Chargement…
    </div>
  );

  return (
    <div style={{ padding: '16px 16px 90px' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 2 }}>Historique</h2>
        <p style={{ fontSize: 12, color: T.muted }}>{orders.length} commande(s) au total</p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 14, scrollbarWidth: 'none' }}>
        {HIST_FILTERS.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12,
            fontWeight: filter === f.v ? 600 : 400, fontFamily: font,
            border: `1.5px solid ${filter === f.v ? T.accent : T.border}`,
            background: filter === f.v ? `${T.accent}20` : 'transparent',
            color: filter === f.v ? T.accent : T.muted,
          }}>{f.l}</button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted }}>
          <p>Aucune commande</p>
        </div>
      ) : (
        displayed.map(order => {
          const cfg = OS[order.status] || { label: order.status, color: T.muted, bg: T.surface };
          return (
            <div key={order.id} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${cfg.color}`, borderRadius: 12,
              padding: 14, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>
                  #{order.order_number || order.id}
                </span>
                <Tag color={cfg.color} bg={cfg.bg}>{cfg.label}</Tag>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: T.muted }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Ic.table} Table {order.table_numero ?? order.table_id}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Ic.receipt} {Number(order.total_amount || 0).toLocaleString('fr-FR')} FCFA
                </span>
                {order.opened_at && (
                  <span>{new Date(order.opened_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </div>
              {(order.items || []).length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: T.sub }}>
                  {order.items.map((it, i) => (
                    <span key={i}>{it.quantity}× {it.plat_nom || it.name}{i < order.items.length - 1 ? ' · ' : ''}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ROOT — ServeurDashboard
// ═══════════════════════════════════════════════════════════════
export default function ServeurDashboard() {
  const { T, toggle, isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState('notifs');

  // Badge commandes prêtes
  const [pretesCount, setPretesCount] = useState(0);
  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await api.get('/orders?status=PRETE');
        setPretesCount(data.length);
      } catch {}
    };
    check();
    const id = setInterval(check, 8000);
    return () => clearInterval(id);
  }, []);

  const tabs = [
    { id: 'notifs',     label: 'Notifs',      icon: Ic.bell,    badge: pretesCount },
    { id: 'livraisons', label: 'Livraisons',  icon: Ic.deliver  },
    { id: 'tables',     label: 'Tables',      icon: Ic.table    },
    { id: 'historique', label: 'Historique',  icon: Ic.history  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;font-family:'DM Sans','Segoe UI',sans-serif;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        button,input,select{font-family:'DM Sans','Segoe UI',sans-serif;}
      `}</style>

      <ToastContainer toasts={toast.toasts} T={T} />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>

        {/* ── TOPBAR ── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
              Kitchen<span style={{ color: T.accent }}>Pulse</span>
            </span>
            <span style={{ background: `${T.accent}20`, color: T.accent, border: `1px solid ${T.accent}30`, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: .5 }}>
              SERVEUR
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.green, fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, background: T.green, borderRadius: '50%', animation: 'pulse 1.8s infinite', display: 'inline-block' }} />
              LIVE
            </span>
            <span style={{ fontSize: 12, color: T.muted }}>{user?.first_name || user?.nom}</span>
            <button onClick={toggle} style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.sub, width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDark ? Ic.sun : Ic.moon}
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ background: `${T.red}20`, border: `1px solid ${T.red}30`, color: T.red, width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Ic.logout}
            </button>
          </div>
        </div>

        {/* ── CONTENU ── */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {page === 'notifs'     && <Notifications toast={toast} T={T} />}
          {page === 'livraisons' && <MesLivraisons toast={toast} T={T} />}
          {page === 'tables'     && <Tables        toast={toast} T={T} />}
          {page === 'historique' && <Historique    toast={toast} T={T} />}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: T.surface, borderTop: `1px solid ${T.border}`, display: 'flex', padding: '8px 0 14px' }}>
          {tabs.map(tab => {
            const active = page === tab.id;
            return (
              <button key={tab.id} onClick={() => setPage(tab.id)} style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, color: active ? T.accent : T.muted, padding: '4px 0',
                position: 'relative',
              }}>
                <span style={{ color: active ? T.accent : T.muted }}>{tab.icon}</span>
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{tab.label}</span>
                {tab.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 'calc(50% - 18px)',
                    background: T.red, color: '#fff', fontSize: 9, fontWeight: 800,
                    width: 16, height: 16, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{tab.badge}</span>
                )}
                {active && <span style={{ width: 20, height: 3, borderRadius: 2, background: T.accent }} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}