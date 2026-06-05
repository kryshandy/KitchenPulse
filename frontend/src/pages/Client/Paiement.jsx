import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

const METHODS = [
  { id: 'MTN_MOMO',      icon: '📱', label: 'MTN Mobile Money',    color: '#FFB800', desc: 'Paiement rapide par mobile' },
  { id: 'ORANGE_MONEY',  icon: '🟠', label: 'Orange Money',        color: '#FF7B00', desc: 'Paiement Orange Money' },
  { id: 'CARTE_BANCAIRE',icon: '💳', label: 'Carte bancaire',      color: '#60A5FA', desc: 'Visa / Mastercard' },
  { id: 'CAISSE',         icon: '💵', label: 'Paiement en caisse', color: '#22D3A0', desc: 'Régler au comptoir' },
];

export default function Paiement() {
  const { orderId } = useParams();
  const { T } = useTheme();
  const navigate = useNavigate();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [method,  setMethod]  = useState('');
  const [phone,   setPhone]   = useState('');
  const [paying,  setPaying]  = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get(`/api/orders/${orderId}`)
      .then(r => { setOrder(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  const handlePay = async () => {
    if (!method) return;
    setError(''); setPaying(true);
    try {
      await api.post('/api/payments', {
        commande_id: orderId,
        method,
        amount: order.total_amount,
        phone: phone || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      </div>
    </>
  );

  // Succès
  if (done) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '0 24px', animation: 'fadeUp .4s ease' }}>
          <div style={{ fontSize: 64, marginBottom: 18 }}>🎉</div>
          <h2 style={{ fontFamily: fontD, fontSize: 26, color: T.green, marginBottom: 8 }}>Paiement confirmé !</h2>
          <p style={{ color: T.sub, fontSize: 14, marginBottom: 24 }}>
            Merci pour ta commande. Bon appétit !
          </p>
          <button onClick={() => navigate(`/avis`)} style={{
            background: T.accent, color: '#0A0C10', border: 'none', borderRadius: 12,
            padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: font, marginBottom: 12, display: 'block', width: '100%',
          }}>
            ⭐ Laisser un avis
          </button>
          <button onClick={() => navigate('/menu')} style={{
            background: 'transparent', border: `1.5px solid ${T.border}`, borderRadius: 12,
            padding: '11px 28px', fontSize: 14, color: T.sub, cursor: 'pointer',
            fontFamily: font, width: '100%',
          }}>
            Retour au menu
          </button>
        </div>
      </div>
    </>
  );

  if (!order) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <p style={{ color: T.muted, fontFamily: font }}>Commande introuvable</p>
      </div>
    </>
  );

  const needsPhone = ['MTN_MOMO', 'ORANGE_MONEY'].includes(method);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 100 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

          <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 4 }}>
            Paiement 💳
          </h1>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>
            Commande {order.order_number} · Table {order.table_number}
          </p>

          {/* Récap montant */}
          <div style={{
            background: T.card, border: `1.5px solid ${T.accent}40`,
            borderRadius: 14, padding: 18, marginBottom: 22,
            textAlign: 'center', boxShadow: T.shadow,
          }}>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>Montant total à payer</p>
            <p style={{ fontFamily: fontD, fontSize: 32, color: T.accent, fontWeight: 800 }}>
              {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
            </p>
            <p style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>
              dont TVA 19,25% incluse
            </p>
          </div>

          {/* Méthodes de paiement */}
          <p style={{ fontSize: 11, color: T.sub, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: .7 }}>
            Choisir un mode de paiement
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {METHODS.map(m => {
              const sel = method === m.id;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: sel ? T.accentGlow : T.card,
                  border: `1.5px solid ${sel ? T.accent : T.border}`,
                  borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                  fontFamily: font, textAlign: 'left', transition: 'all .18s',
                  boxShadow: T.shadow,
                }}>
                  <span style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${m.color}18`, border: `1px solid ${m.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{m.label}</p>
                    <p style={{ color: T.muted, fontSize: 12 }}>{m.desc}</p>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${sel ? T.accent : T.border}`,
                    background: sel ? T.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {sel && <span style={{ color: '#0A0C10', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Numéro de téléphone si Mobile Money */}
          {needsPhone && (
            <div style={{ marginBottom: 20, animation: 'fadeUp .25s ease' }}>
              <label style={{ display: 'block', fontSize: 11, color: T.sub, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .7 }}>
                Numéro Mobile Money
              </label>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                style={{
                  width: '100%', background: T.surface, border: `1.5px solid ${T.border}`,
                  borderRadius: 10, color: T.text, fontFamily: font, fontSize: 14,
                  padding: '12px 14px', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e  => e.target.style.borderColor = T.border}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(245,101,101,.1)', border: '1px solid rgba(245,101,101,.25)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: T.red, fontSize: 13,
            }}>{error}</div>
          )}

          {/* Bouton payer */}
          <button onClick={handlePay} disabled={!method || paying} style={{
            width: '100%', padding: 15, background: method ? T.green : T.muted,
            color: '#0A0C10', border: 'none', borderRadius: 14, fontFamily: font,
            fontSize: 16, fontWeight: 700, cursor: method && !paying ? 'pointer' : 'not-allowed',
            transition: 'all .2s', animation: method && !paying ? 'glow 2s ease infinite' : 'none',
          }}>
            {paying ? '⏳ Traitement en cours…'
              : !method ? 'Choisir un mode de paiement'
              : `✓ Confirmer le paiement · ${Number(order.total_amount).toLocaleString('fr-FR')} FCFA`}
          </button>

          <button onClick={() => navigate(`/suivi/${orderId}`)} style={{
            width: '100%', padding: 11, marginTop: 10, background: 'transparent',
            border: `1px solid ${T.border}`, borderRadius: 12, color: T.sub,
            cursor: 'pointer', fontFamily: font, fontSize: 13,
          }}>← Retour au suivi</button>
        </div>
      </div>
    </>
  );
}