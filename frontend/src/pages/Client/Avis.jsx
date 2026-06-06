import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

export default function Avis() {
  const { T } = useTheme();
  const navigate = useNavigate();

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sent,     setSent]     = useState({}); // { platId: true }
  const [active,   setActive]   = useState(null); // { orderId, platId, platName }
  const [note,     setNote]     = useState(0);
  const [comment,  setComment]  = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [msg,      setMsg]      = useState('');

  useEffect(() => {
    api.get('/orders')
      .then(r => {
        // Garder seulement commandes servies/clôturées
        const done = r.data.filter(o => ['SERVIE','CLOTUREE'].includes(o.status));
        // Pour chaque commande, charger les items
        Promise.all(done.map(o => api.get(`/orders/${o.id}`)))
          .then(results => setOrders(results.map(r => r.data)))
          .catch(() => {})
          .finally(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!note || !active) return;
    setSubmitting(true); setMsg('');
    try {
      await api.post('/reviews', {
        plat_id: active.platId,
        note,
        commentaire: comment || undefined,
      });
      setSent(prev => ({ ...prev, [active.platId]: note }));
      setMsg('Avis envoyé, merci ! ⭐');
      setTimeout(() => { setActive(null); setNote(0); setComment(''); setMsg(''); }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const allItems = orders.flatMap(o =>
    (o.items || []).map(item => ({ ...item, order_number: o.order_number, opened_at: o.opened_at }))
  );
  // Dédoublonner par plat_id
  const unique = [...new Map(allItems.map(i => [i.plat_id, i])).values()];

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 100 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>

          <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 6 }}>
            Mes avis ⭐
          </h1>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>
            Note les plats que tu as commandés
          </p>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 30, height: 30, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            </div>
          )}

          {!loading && unique.length === 0 && (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🍽️</div>
              <p style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>
                Aucun plat à noter pour l'instant.<br />
                Les avis sont disponibles après la livraison.
              </p>
              <button onClick={() => navigate('/menu')} style={{
                background: T.accent, color: '#0A0C10', border: 'none',
                borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: font,
              }}>Voir le menu</button>
            </div>
          )}

          {unique.map(item => {
            const alreadySent = sent[item.plat_id];
            const isActive    = active?.platId === item.plat_id;

            return (
              <div key={item.plat_id} style={{
                background: T.card, border: `1.5px solid ${isActive ? T.accent : T.border}`,
                borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: T.shadow,
                animation: 'fadeUp .3s ease both', transition: 'border-color .2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                    <p style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>
                      {item.order_number} · {new Date(item.opened_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {alreadySent ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ fontSize: 16, color: n <= alreadySent ? T.accent : T.muted }}>★</span>
                      ))}
                    </div>
                  ) : (
                    <span style={{
                      background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 20, padding: '3px 10px', fontSize: 11, color: T.muted,
                    }}>Non noté</span>
                  )}
                </div>

                {!alreadySent && !isActive && (
                  <button onClick={() => { setActive({ platId: item.plat_id, platName: item.name }); setNote(0); setComment(''); }}
                    style={{
                      background: T.accentGlow, border: `1.5px solid ${T.accent}`,
                      borderRadius: 10, padding: '8px 18px', color: T.accent,
                      cursor: 'pointer', fontFamily: font, fontSize: 13, fontWeight: 600,
                    }}>
                    ★ Donner mon avis
                  </button>
                )}

                {isActive && (
                  <div style={{ animation: 'fadeUp .25s ease' }}>
                    {/* Étoiles */}
                    <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .6 }}>
                      Ta note
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setNote(n)} style={{
                          width: 40, height: 40, borderRadius: 10,
                          border: `2px solid ${note >= n ? T.accent : T.border}`,
                          background: note >= n ? T.accentGlow : T.surface,
                          fontSize: 20, cursor: 'pointer', transition: 'all .15s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {note >= n ? '⭐' : '☆'}
                        </button>
                      ))}
                      {note > 0 && (
                        <span style={{ color: T.accent, fontSize: 13, fontWeight: 600, alignSelf: 'center', marginLeft: 4 }}>
                          {['','Mauvais','Passable','Bien','Très bien','Excellent !'][note]}
                        </span>
                      )}
                    </div>

                    {/* Commentaire */}
                    <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .6 }}>
                      Commentaire <span style={{ color: T.muted, fontWeight: 400 }}>(facultatif)</span>
                    </p>
                    <textarea
                      value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Parle-nous de ton expérience…"
                      rows={3}
                      style={{
                        width: '100%', background: T.surface, border: `1.5px solid ${T.border}`,
                        borderRadius: 10, color: T.text, fontFamily: font, fontSize: 13,
                        padding: '10px 12px', outline: 'none', resize: 'vertical',
                        marginBottom: 12,
                      }}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e  => e.target.style.borderColor = T.border}
                    />

                    {msg && (
                      <p style={{ color: msg.includes('merci') ? T.green : T.red, fontSize: 13, marginBottom: 8 }}>{msg}</p>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={handleSubmit} disabled={!note || submitting} style={{
                        flex: 2, padding: '11px', background: T.accent, color: '#0A0C10',
                        border: 'none', borderRadius: 10, fontFamily: font, fontSize: 14,
                        fontWeight: 700, cursor: note && !submitting ? 'pointer' : 'not-allowed',
                        opacity: note ? 1 : .5,
                      }}>
                        {submitting ? 'Envoi…' : 'Envoyer ✓'}
                      </button>
                      <button onClick={() => setActive(null)} style={{
                        flex: 1, padding: '11px', background: T.surface,
                        border: `1.5px solid ${T.border}`, borderRadius: 10,
                        color: T.sub, cursor: 'pointer', fontFamily: font, fontSize: 13,
                      }}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}