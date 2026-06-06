import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

const STEPS = [
  { status: 'RECUE',          label: 'Commande reçue',      icon: '📋' },
  { status: 'EN_PREPARATION', label: 'En préparation',      icon: '👨‍🍳' },
  { status: 'PRETE',          label: 'Prête',               icon: '✅' },
  { status: 'SERVIE',         label: 'Livrée à table',      icon: '🍽️' },
];

const STATUS_LABEL = {
  RECUE:          { label: 'Commande reçue',    color: '#F5A623', bg: 'rgba(245,166,35,.15)'  },
  EN_PREPARATION: { label: 'En préparation',    color: '#F0A500', bg: 'rgba(240,165,0,.15)'   },
  PRETE:          { label: 'Prête !',           color: '#22D3A0', bg: 'rgba(34,211,160,.15)'  },
  SERVIE:         { label: 'Livrée',            color: '#8B5CF6', bg: 'rgba(139,92,246,.15)'  },
  CLOTUREE:       { label: 'Clôturée',          color: '#6B7280', bg: 'rgba(107,114,128,.15)' },
  ANNULEE:        { label: 'Annulée',           color: '#F56565', bg: 'rgba(245,101,101,.15)' },
};

export default function SuiviCommande() {
  const { T } = useTheme();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
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
          const active = r.data.filter(o => !['CLOTUREE','ANNULEE'].includes(o.status));
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

          <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 6 }}>
            Suivi de commande 📍
          </h1>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>
            Mise à jour automatique toutes les 8 secondes
          </p>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 30, height: 30, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🍽️</div>
              <p style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>
                Aucune commande en cours
              </p>
              <button onClick={() => navigate('/menu')} style={{
                background: T.accent, color: '#0A0C10', border: 'none',
                borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: font,
              }}>Commander</button>
            </div>
          )}

          {/* Sélecteur si plusieurs commandes */}
          {orders.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
              {orders.map(o => {
                const cfg = STATUS_LABEL[o.status] || {};
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
                    <span style={{ marginLeft: 6, color: cfg.color, fontSize: 10 }}>● {cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {selected && (() => {
            const cfg = STATUS_LABEL[selected.status] || { label: selected.status, color: T.muted, bg: T.surface };
            const currentStep = stepIndex(selected.status);

            return (
              <div style={{ animation: 'fadeUp .3s ease' }}>
                {/* Header commande */}
                <div style={{
                  background: T.card, border: `1.5px solid ${T.border}`,
                  borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: T.shadow,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <p style={{ color: T.text, fontWeight: 800, fontSize: 18 }}>
                        #{selected.order_number || selected.id}
                      </p>
                      <p style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>
                        Table {selected.table_numero ?? selected.table_id}
                        {selected.opened_at ? ` · ${new Date(selected.opened_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                      </p>
                    </div>
                    <span style={{
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.color}40`,
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    }}>{cfg.label}</span>
                  </div>

                  {/* Barre de progression */}
                  {!['CLOTUREE', 'ANNULEE'].includes(selected.status) && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        {STEPS.map((step, i) => {
                          const done    = i <= currentStep;
                          const current = i === currentStep;
                          return (
                            <div key={step.status} style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: '50%', margin: '0 auto 6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: done ? (current ? T.accent : `${T.accent}60`) : T.surface,
                                border: `2px solid ${done ? T.accent : T.border}`,
                                fontSize: 16, transition: 'all .3s',
                                boxShadow: current ? `0 0 12px ${T.accentGlow}` : 'none',
                              }}>
                                {step.icon}
                              </div>
                              <p style={{ fontSize: 9, color: done ? T.accent : T.muted, fontWeight: done ? 700 : 400, lineHeight: 1.3 }}>
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {/* Ligne de progression */}
                      <div style={{ height: 3, background: T.border, borderRadius: 2, position: 'relative', margin: '-26px 18px 20px' }}>
                        <div style={{
                          position: 'absolute', left: 0, top: 0, height: '100%',
                          background: T.accent, borderRadius: 2,
                          width: `${Math.min(100, (currentStep / (STEPS.length - 1)) * 100)}%`,
                          transition: 'width .5s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  <p style={{ color: T.accent, fontWeight: 800, fontSize: 17, textAlign: 'right', marginTop: 8 }}>
                    Total : {Number(selected.total_amount || 0).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                {/* Items de la commande */}
                <div style={{
                  background: T.card, border: `1.5px solid ${T.border}`,
                  borderRadius: 14, padding: 16, marginBottom: 14,
                }}>
                  <p style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 12 }}>
                    Détail de la commande
                  </p>
                  {(selected.items || []).map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: i < selected.items.length - 1 ? `1px solid ${T.border}` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: `${T.accent}20`, color: T.accent,
                          fontWeight: 700, fontSize: 11, minWidth: 24, height: 22,
                          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>×{item.quantity}</span>
                        <span style={{ color: T.text, fontSize: 13 }}>{item.plat_nom || item.name}</span>
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
                    borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: T.accent,
                  }}>
                    📝 {selected.notes}
                  </div>
                )}

                {/* Bouton avis si livré */}
                {['SERVIE', 'CLOTUREE'].includes(selected.status) && (
                  <button onClick={() => navigate('/avis')} style={{
                    width: '100%', padding: 13, background: T.accent,
                    color: '#0A0C10', border: 'none', borderRadius: 12,
                    fontFamily: font, fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  }}>
                    ⭐ Donner mon avis
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