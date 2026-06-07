import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

// ─── Icônes SVG ───────────────────────────────────────────────
const IcStar = ({ filled, size = 28, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcPlate = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);
const IcClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const NOTE_LABELS = ['', 'Mauvais 😞', 'Passable 😐', 'Bien 🙂', 'Très bien 😊', 'Excellent ! 🤩'];

export default function Avis() {
  const { T } = useTheme();
  const navigate = useNavigate();

  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [sent,        setSent]        = useState({});
  const [active,      setActive]      = useState(null);
  const [note,        setNote]        = useState(0);
  const [hovered,     setHovered]     = useState(0);
  const [comment,     setComment]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [msg,         setMsg]         = useState('');

  useEffect(() => {
    api.get('/orders')
      .then(r => {
        const done = r.data.filter(o => ['SERVIE', 'CLOTUREE'].includes(o.status));
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
        plat_id:     active.platId,
        note,
        commentaire: comment || undefined,
      });
      setSent(prev => ({ ...prev, [active.platId]: note }));
      setMsg('Avis envoyé, merci !');
      setTimeout(() => { setActive(null); setNote(0); setHovered(0); setComment(''); setMsg(''); }, 1800);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally { setSubmitting(false); }
  };

  const allItems = orders.flatMap(o =>
    (o.items || []).map(item => ({ ...item, order_number: o.order_number, opened_at: o.opened_at }))
  );
  const unique = [...new Map(allItems.map(i => [i.plat_id, i])).values()];

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 100 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>

          {/* Titre */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 4 }}>
              Mes avis
            </h1>
            <p style={{ color: T.muted, fontSize: 13 }}>
              Note les plats que tu as commandés
            </p>
          </div>

          {/* Loader */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 30, height: 30, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            </div>
          )}

          {/* Vide */}
          {!loading && unique.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: T.border, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <IcPlate size={52} />
              </div>
              <p style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>
                Aucun plat à noter pour l'instant.<br />
                Les avis sont disponibles après la livraison.
              </p>
              <button onClick={() => navigate('/menu')} style={{
                background: T.accent, color: '#0A0C10', border: 'none',
                borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: font,
              }}>
                Voir le menu
              </button>
            </div>
          )}

          {/* Liste des plats à noter */}
          {unique.map(item => {
            const alreadySent = sent[item.plat_id];
            const isActive    = active?.platId === item.plat_id;

            return (
              <div key={item.plat_id} style={{
                background: T.card,
                border: `1.5px solid ${isActive ? T.accent : alreadySent ? T.green : T.border}`,
                borderRadius: 14, padding: 16, marginBottom: 12,
                transition: 'border-color .2s',
              }}>
                {/* Header item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ color: T.text, fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                      {item.plat_nom || item.name}
                    </p>
                    <p style={{ color: T.muted, fontSize: 11 }}>
                      {item.order_number} · {new Date(item.opened_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* Étoiles déjà données */}
                  {alreadySent ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {[1,2,3,4,5].map(n => (
                        <IcStar key={n} filled={n <= alreadySent} size={16} color={T.accent} />
                      ))}
                    </div>
                  ) : (
                    <span style={{
                      background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 20, padding: '3px 10px', fontSize: 11, color: T.muted,
                    }}>
                      Non noté
                    </span>
                  )}
                </div>

                {/* Message succès */}
                {isActive && msg && (
                  <div style={{
                    background: `${T.green}15`, border: `1px solid ${T.green}40`,
                    borderRadius: 8, padding: '8px 12px', marginBottom: 10,
                    fontSize: 13, color: T.green, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <IcCheck /> {msg}
                  </div>
                )}

                {/* Bouton ouvrir */}
                {!alreadySent && !isActive && (
                  <button
                    onClick={() => { setActive({ platId: item.plat_id, platName: item.plat_nom || item.name }); setNote(0); setHovered(0); setComment(''); setMsg(''); }}
                    style={{
                      background: `${T.accent}15`, border: `1.5px solid ${T.accent}40`,
                      borderRadius: 10, padding: '8px 18px', color: T.accent,
                      cursor: 'pointer', fontFamily: font, fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <IcStar filled={false} size={14} color={T.accent} /> Donner mon avis
                  </button>
                )}

                {/* Formulaire avis */}
                {isActive && (
                  <div style={{ animation: 'fadeUp .25s ease' }}>

                    {/* Étoiles interactives */}
                    <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 10 }}>
                      Ta note
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n}
                          onClick={() => setNote(n)}
                          onMouseEnter={() => setHovered(n)}
                          onMouseLeave={() => setHovered(0)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                            transform: (hovered || note) >= n ? 'scale(1.15)' : 'scale(1)',
                            transition: 'transform .15s',
                          }}
                        >
                          <IcStar
                            filled={(hovered || note) >= n}
                            size={32}
                            color={T.accent}
                          />
                        </button>
                      ))}
                    </div>
                    {(hovered || note) > 0 && (
                      <p style={{ color: T.accent, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                        {NOTE_LABELS[hovered || note]}
                      </p>
                    )}

                    {/* Commentaire */}
                    <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>
                      Commentaire <span style={{ fontWeight: 400, opacity: .6 }}>(facultatif)</span>
                    </p>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Parle-nous de ton expérience…"
                      rows={3}
                      style={{
                        width: '100%', background: T.surface,
                        border: `1.5px solid ${T.border}`, borderRadius: 10,
                        color: T.text, fontFamily: font, fontSize: 13,
                        padding: '10px 12px', outline: 'none', resize: 'vertical',
                        marginBottom: 14, boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e  => e.target.style.borderColor = T.border}
                    />

                    {/* Erreur */}
                    {msg && !msg.includes('merci') && (
                      <p style={{ color: T.red, fontSize: 13, marginBottom: 10 }}>{msg}</p>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={handleSubmit}
                        disabled={!note || submitting}
                        style={{
                          flex: 2, padding: '12px', background: note ? T.accent : T.border,
                          color: note ? '#0A0C10' : T.muted, border: 'none', borderRadius: 10,
                          fontFamily: font, fontSize: 14, fontWeight: 700,
                          cursor: note && !submitting ? 'pointer' : 'not-allowed',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'background .2s',
                        }}
                      >
                        <IcCheck /> {submitting ? 'Envoi…' : 'Envoyer'}
                      </button>
                      <button
                        onClick={() => { setActive(null); setNote(0); setHovered(0); setComment(''); setMsg(''); }}
                        style={{
                          flex: 1, padding: '12px', background: T.surface,
                          border: `1.5px solid ${T.border}`, borderRadius: 10,
                          color: T.sub, cursor: 'pointer', fontFamily: font, fontSize: 13,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                      >
                        <IcClose /> Annuler
                      </button>
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