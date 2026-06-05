import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

const STATUS_MAP = {
  RECUE:              { label: 'Commande reçue',      icon: '📥', color: '#60A5FA', step: 1 },
  EN_PREPARATION:     { label: 'En préparation',       icon: '👨‍🍳', color: '#F5A623', step: 2 },
  PRETE:              { label: 'Prête !',              icon: '✅', color: '#22D3A0', step: 3 },
  EN_COURS_DE_SERVICE:{ label: 'En cours de service',  icon: '🤵', color: '#A78BFA', step: 4 },
  SERVIE:             { label: 'Servie',               icon: '🍽️', color: '#22D3A0', step: 5 },
  CLOTUREE:           { label: 'Terminée',             icon: '✓',  color: '#6B7280', step: 6 },
  ANNULEE:            { label: 'Annulée',              icon: '✕',  color: '#F56565', step: 0 },
};
const STEPS = ['RECUE', 'EN_PREPARATION', 'PRETE', 'EN_COURS_DE_SERVICE', 'SERVIE'];

export default function SuiviCommande() {
  const { orderId } = useParams();
  const { T } = useTheme();
  const navigate = useNavigate();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [myOrders,setMyOrders]= useState([]);

  const loadOrder = useCallback(() => {
    if (!orderId) return;
    api.get(`/api/orders/${orderId}`)
      .then(r => { setOrder(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      const iv = setInterval(loadOrder, 5000);
      return () => clearInterval(iv);
    } else {
      api.get('/api/orders').then(r => setMyOrders(r.data)).catch(() => {});
      setLoading(false);
    }
  }, [orderId, loadOrder]);

  const statusInfo = order ? (STATUS_MAP[order.status] || STATUS_MAP.RECUE) : null;
  const currentStep = statusInfo?.step || 1;
  const isServed = order && ['SERVIE', 'CLOTUREE'].includes(order.status);

  // ── Liste des commandes (pas d'orderId) ──
  if (!orderId) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 90 }}>
          <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
            <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 18 }}>
              Mes commandes 📍
            </h1>
            {myOrders.length === 0
              ? <p style={{ color: T.muted, textAlign: 'center', padding: 40 }}>Aucune commande</p>
              : myOrders.map(o => {
                  const s = STATUS_MAP[o.status] || STATUS_MAP.RECUE;
                  return (
                    <div key={o.id} onClick={() => navigate(`/suivi/${o.id}`)} style={{
                      background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 14,
                      padding: 16, marginBottom: 10, cursor: 'pointer', transition: 'border-color .2s',
                      boxShadow: T.shadow,
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ color: T.text, fontWeight: 600 }}>{o.order_number}</span>
                        <span style={{ color: s.color, fontSize: 13, fontWeight: 600 }}>{s.icon} {s.label}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: T.muted, fontSize: 12 }}>
                          Table {o.table_number} · {new Date(o.opened_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span style={{ color: T.accent, fontWeight: 700, fontSize: 13 }}>
                          {Number(o.total_amount).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </>
    );
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <p style={{ color: T.muted, fontFamily: font }}>Chargement…</p>
      </div>
    </>
  );

  if (!order) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: T.muted, fontFamily: font }}>Commande introuvable</p>
        <button onClick={() => navigate('/menu')} style={{ background: T.accent, color: '#0A0C10', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: font, fontWeight: 700 }}>
          Retour au menu
        </button>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 100 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>

          {/* Statut principal */}
          <div style={{
            background: T.card, border: `1.5px solid ${statusInfo.color}40`,
            borderRadius: 18, padding: 24, marginBottom: 18, textAlign: 'center',
            boxShadow: T.shadow, animation: 'fadeUp .4s ease',
          }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>{statusInfo.icon}</div>
            <p style={{ color: T.muted, fontSize: 12, marginBottom: 4 }}>{order.order_number} · Table {order.table_number}</p>
            <h2 style={{ fontFamily: fontD, fontSize: 22, color: statusInfo.color, marginBottom: 6 }}>
              {statusInfo.label}
            </h2>
            <p style={{ color: T.muted, fontSize: 12 }}>
              Mis à jour : {new Date(order.updated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            {!isServed && order.status !== 'ANNULEE' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-flex' }}>
                  <span style={{ position: 'absolute', inset: 0, background: T.green, borderRadius: '50%', animation: 'ping 1.4s ease infinite', opacity: .5 }} />
                  <span style={{ width: 8, height: 8, background: T.green, borderRadius: '50%' }} />
                </span>
                <span style={{ fontSize: 11, color: T.green }}>LIVE · actualisation toutes les 5s</span>
              </div>
            )}
          </div>

          {/* Barre de progression */}
          {order.status !== 'ANNULEE' && (
            <div style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: 18, marginBottom: 18, boxShadow: T.shadow,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                {STEPS.map((s, i) => {
                  const info = STATUS_MAP[s];
                  const done = currentStep > i + 1;
                  const curr = currentStep === i + 1;
                  return (
                    <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      {/* Ligne de connexion */}
                      {i > 0 && (
                        <div style={{
                          position: 'absolute', left: '-50%', top: 15, width: '100%', height: 2,
                          background: T.border, zIndex: 0,
                        }}>
                          <div style={{
                            height: '100%', background: T.accent,
                            transition: 'width .5s ease',
                            width: done ? '100%' : curr ? '50%' : '0%',
                          }} />
                        </div>
                      )}
                      {/* Cercle */}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', zIndex: 1,
                        background: done ? T.accent : curr ? `${info.color}20` : T.surface,
                        border: `2px solid ${done ? T.accent : curr ? info.color : T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: done ? 14 : 16, marginBottom: 5, transition: 'all .3s',
                      }}>
                        {done ? '✓' : info.icon}
                      </div>
                      <span style={{
                        fontSize: 9, color: curr ? info.color : done ? T.sub : T.muted,
                        textAlign: 'center', lineHeight: 1.2, fontWeight: curr ? 700 : 400,
                        maxWidth: 54,
                      }}>{info.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Articles */}
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: 16, marginBottom: 18, boxShadow: T.shadow,
          }}>
            <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .7 }}>
              Ta commande
            </p>
            {order.items?.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: `1px solid ${T.border}`,
              }}>
                <div>
                  <p style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                  <p style={{ color: T.muted, fontSize: 11 }}>× {item.quantity}</p>
                </div>
                <p style={{ color: T.accent, fontSize: 13, fontWeight: 700 }}>
                  {Number(item.subtotal || item.item_total || 0).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
              <span style={{ color: T.text, fontWeight: 700 }}>Total</span>
              <span style={{ color: T.accent, fontWeight: 700, fontSize: 16 }}>
                {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Bouton Payer — si servi */}
          {isServed && order.payment_status === 'EN_ATTENTE' && (
            <button onClick={() => navigate(`/paiement/${order.id}`)} style={{
              width: '100%', padding: 15, background: T.green, color: '#0A0C10',
              border: 'none', borderRadius: 14, fontFamily: font, fontSize: 16,
              fontWeight: 700, cursor: 'pointer', marginBottom: 14,
              animation: 'glow 2s ease infinite',
            }}>
              💳 Payer · {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
            </button>
          )}

          <button onClick={() => navigate('/menu')} style={{
            width: '100%', padding: 12, background: 'transparent',
            border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.sub,
            cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;  e.currentTarget.style.color = T.sub; }}>
            ← Retour au menu
          </button>
        </div>
      </div>
    </>
  );
}