import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

// ─── Icônes SVG ───────────────────────────────────────────────
const IcClipboard = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>
);
const IcChef = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);
const IcCheck = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcServe = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);
const IcStar = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcNote = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IcPlate = ({ size = 48, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);

// ─── Étapes de suivi ──────────────────────────────────────────
const STEPS = [
  { status: 'RECUE',          label: 'Reçue',        Icon: IcClipboard },
  { status: 'EN_PREPARATION', label: 'En cuisine',   Icon: IcChef      },
  { status: 'PRETE',          label: 'Prête',        Icon: IcCheck     },
  { status: 'SERVIE',         label: 'Livrée',       Icon: IcServe     },
];

const STATUS_LABEL = {
  RECUE:          { label: 'Commande reçue',  color: '#F5A623', bg: 'rgba(245,166,35,.15)'  },
  EN_PREPARATION: { label: 'En préparation', color: '#F0A500', bg: 'rgba(240,165,0,.15)'   },
  PRETE:          { label: 'Prête !',        color: '#22D3A0', bg: 'rgba(34,211,160,.15)'  },
  SERVIE:         { label: 'Livrée',         color: '#8B5CF6', bg: 'rgba(139,92,246,.15)'  },
  CLOTUREE:       { label: 'Clôturée',       color: '#6B7280', bg: 'rgba(107,114,128,.15)' },
  ANNULEE:        { label: 'Annulée',        color: '#F56565', bg: 'rgba(245,101,101,.15)' },
};

export default function SuiviCommande() {
  const { T } = useTheme();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    if (orderId) {
      api.get(`/orders/${orderId}`)
        .then(r => { setOrders([r.data]); setSelected(r.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      api.get('/orders')
        .then(r => {
          const active = r.data.filter(o => !['CLOTUREE', 'ANNULEE'].includes(o.status));
          setOrders(active);
          if (active.length) setSelected(active[0]);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [orderId]);

  const stepIndex = (status) => STEPS.findIndex(s => s.status === status);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 100 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>

          {/* Titre */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 4 }}>
              Suivi de commande
            </h1>
            <p style={{ color: T.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, background: T.green, borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.8s infinite' }} />
              Mise à jour automatique toutes les 8 secondes
            </p>
          </div>

          {/* Loader */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 30, height: 30, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            </div>
          )}

          {/* Vide */}
          {!loading && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: T.border, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <IcPlate size={52} color={T.border} />
              </div>
              <p style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>
                Aucune commande en cours
              </p>
              <button onClick={() => navigate('/menu')} style={{
                background: T.accent, color: '#0A0C10', border: 'none',
                borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: font,
              }}>
                Commander
              </button>
            </div>
          )}

          {/* Sélecteur si plusieurs commandes */}
          {orders.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4, scrollbarWidth: 'none' }}>
              {orders.map(o => {
                const cfg    = STATUS_LABEL[o.status] || {};
                const active = selected?.id === o.id;
                return (
                  <button key={o.id} onClick={() => setSelected(o)} style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${active ? T.accent : T.border}`,
                    background: active ? `${T.accent}20` : T.surface,
                    color: active ? T.accent : T.sub, fontSize: 12, fontWeight: 600,
                    fontFamily: font,
                  }}>
                    #{o.order_number || o.id}
                    <span style={{ marginLeft: 6, color: cfg.color, fontSize: 10 }}>
                      ● {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Détail commande sélectionnée */}
          {selected && (() => {
            const cfg         = STATUS_LABEL[selected.status] || { label: selected.status, color: T.muted, bg: T.surface };
            const currentStep = stepIndex(selected.status);

            return (
              <div style={{ animation: 'fadeUp .3s ease' }}>

                {/* Card principale */}
                <div style={{
                  background: T.card, border: `1.5px solid ${T.border}`,
                  borderRadius: 18, padding: 20, marginBottom: 14,
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div>
                      <p style={{ color: T.text, fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
                        #{selected.order_number || selected.id}
                      </p>
                      <p style={{ color: T.muted, fontSize: 12 }}>
                        Table {selected.table_numero ?? selected.table_id}
                        {selected.opened_at
                          ? ` · ${new Date(selected.opened_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                          : ''}
                      </p>
                    </div>
                    <span style={{
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.color}40`,
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Barre de progression SVG */}
                  {!['CLOTUREE', 'ANNULEE'].includes(selected.status) && (
                    <div style={{ marginBottom: 16 }}>
                      {/* Icônes des étapes */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', marginBottom: 8 }}>
                        {STEPS.map((step, i) => {
                          const done    = i <= currentStep;
                          const current = i === currentStep;
                          const { Icon } = step;
                          return (
                            <div key={step.status} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: done ? (current ? T.accent : `${T.accent}55`) : T.surface,
                                border: `2px solid ${done ? T.accent : T.border}`,
                                transition: 'all .4s',
                                boxShadow: current ? `0 0 14px ${T.accent}60` : 'none',
                              }}>
                                <Icon
                                  size={18}
                                  color={done ? (current ? '#0A0C10' : T.accent) : T.muted}
                                />
                              </div>
                              <p style={{
                                fontSize: 9, textAlign: 'center', lineHeight: 1.3,
                                color: done ? T.accent : T.muted,
                                fontWeight: done ? 700 : 400,
                              }}>
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Ligne de progression */}
                      <div style={{ height: 3, background: T.border, borderRadius: 2, margin: '-38px 20px 28px', position: 'relative', zIndex: 0 }}>
                        <div style={{
                          position: 'absolute', left: 0, top: 0, height: '100%',
                          background: T.accent, borderRadius: 2,
                          width: `${Math.min(100, (currentStep / (STEPS.length - 1)) * 100)}%`,
                          transition: 'width .6s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                    <p style={{ color: T.accent, fontWeight: 800, fontSize: 17 }}>
                      Total : {Number(selected.total_amount || 0).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>

                {/* Détail des articles */}
                <div style={{
                  background: T.card, border: `1.5px solid ${T.border}`,
                  borderRadius: 14, padding: 16, marginBottom: 14,
                }}>
                  <p style={{
                    fontSize: 10, color: T.muted, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: .7, marginBottom: 12,
                  }}>
                    Détail de la commande
                  </p>
                  {(selected.items || []).length === 0 && (
                    <p style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
                      Aucun article
                    </p>
                  )}
                  {(selected.items || []).map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '9px 0',
                      borderBottom: i < selected.items.length - 1 ? `1px solid ${T.border}` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          background: `${T.accent}20`, color: T.accent,
                          fontWeight: 800, fontSize: 11, minWidth: 26, height: 24,
                          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          ×{item.quantity}
                        </span>
                        <span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>
                          {item.plat_nom || item.name}
                        </span>
                      </div>
                      <span style={{ color: T.sub, fontSize: 13 }}>
                        {(Number(item.unit_price) * item.quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div style={{
                    background: `${T.accent}10`, border: `1px solid ${T.accent}30`,
                    borderRadius: 12, padding: '12px 14px', marginBottom: 14,
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}>
                    <span style={{ color: T.accent, flexShrink: 0, marginTop: 1 }}>
                      <IcNote color={T.accent} />
                    </span>
                    <p style={{ color: T.accent, fontSize: 13, lineHeight: 1.5 }}>
                      {selected.notes}
                    </p>
                  </div>
                )}

                {/* Bouton avis si livré */}
                {['SERVIE', 'CLOTUREE'].includes(selected.status) && (
                  <button onClick={() => navigate('/avis')} style={{
                    width: '100%', padding: 14, background: T.accent,
                    color: '#0A0C10', border: 'none', borderRadius: 13,
                    fontFamily: font, fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <IcStar size={18} color="#0A0C10" />
                    Donner mon avis
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}