import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

// ─── Icônes SVG ───────────────────────────────────────────────
const IcClipboard = ({ size=20, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>
);
const IcChef = ({ size=20, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);
const IcCheck = ({ size=20, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcServe = ({ size=20, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);
const IcStar = ({ size=16, color='currentColor', filled=false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcNote = ({ size=14, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IcPhone    = ({ size=22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcCard     = ({ size=22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IcCash     = ({ size=22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>;
const IcQr       = ({ size=22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg>;

const STEPS = [
  { status: 'RECUE',          label: 'Reçue',      Icon: IcClipboard },
  { status: 'EN_PREPARATION', label: 'En cuisine', Icon: IcChef      },
  { status: 'PRETE',          label: 'Prête',      Icon: IcCheck     },
  { status: 'SERVIE',         label: 'Livrée',     Icon: IcServe     },
];

const STATUS_LABEL = {
  RECUE:          { label: 'Commande reçue',  color: '#F5A623', bg: 'rgba(245,166,35,.15)'  },
  EN_PREPARATION: { label: 'En préparation', color: '#F0A500', bg: 'rgba(240,165,0,.15)'   },
  PRETE:          { label: 'Prête !',        color: '#22D3A0', bg: 'rgba(34,211,160,.15)'  },
  SERVIE:         { label: 'Livrée',         color: '#8B5CF6', bg: 'rgba(139,92,246,.15)'  },
  CLOTUREE:       { label: 'Clôturée',       color: '#6B7280', bg: 'rgba(107,114,128,.15)' },
  ANNULEE:        { label: 'Annulée',        color: '#F56565', bg: 'rgba(245,101,101,.15)' },
};

// Modes de paiement
const PAY_MODES = [
  { id: 'MTN_MOMO',       label: 'MTN MoMo',      Icon: IcPhone },
  { id: 'ORANGE_MONEY',   label: 'Orange Money',  Icon: IcPhone },
  { id: 'CARTE_BANCAIRE', label: 'Carte bancaire',Icon: IcCard  },
  { id: 'CAISSE',         label: 'Caisse',        Icon: IcCash  },
  { id: 'QR_LOCAL',       label: 'QR Code',       Icon: IcQr    },
];

const NOTE_LABELS = ['','Mauvais','Passable','Bien','Très bien','Excellent !'];

// ─── Modal Paiement + Avis ────────────────────────────────────
function PayModal({ order, T, onClose, onDone }) {
  const [step,       setStep]       = useState('pay'); // 'pay' | 'avis'
  const [payMode,    setPayMode]    = useState('');
  const [paying,     setPaying]     = useState(false);
  const [payMsg,     setPayMsg]     = useState('');
  const [payOk,      setPayOk]      = useState(false);

  // Avis
  const items = order.items || [];
  const [notes,    setNotes]    = useState({});   // { plat_id: note }
  const [hovered,  setHovered]  = useState({});
  const [comments, setComments] = useState({});
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState({});
  const [avisMsg,  setAvisMsg]  = useState('');

  const payer = async () => {
    if (!payMode) { setPayMsg('Choisissez un mode de paiement'); return; }
    setPaying(true); setPayMsg('');
    try {
      await api.post('/payments', {
        commande_id: order.id,
        method:      payMode,
        amount:      order.total_amount,
      });
      setPayOk(true);
      setTimeout(() => setStep('avis'), 1200);
    } catch (e) {
      setPayMsg(e.response?.data?.message || 'Erreur paiement');
    } finally { setPaying(false); }
  };

  const envoyerAvis = async (platId) => {
    const note = notes[platId];
    if (!note) return;
    setSending(true);
    try {
      await api.post('/reviews', {
        plat_id:     platId,
        note,
        commentaire: comments[platId] || undefined,
      });
      setSent(p => ({ ...p, [platId]: true }));
    } catch (e) {
      setAvisMsg(e.response?.data?.message || 'Erreur envoi avis');
    } finally { setSending(false); }
  };

  const toutEnvoye = items.length > 0 && items.every(i => sent[i.plat_id]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: T.card, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '20px 20px 40px' }}>

        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: '0 auto 16px' }} />

        {/* ── ÉTAPE PAIEMENT ── */}
        {step === 'pay' && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 4 }}>Paiement</h2>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>
              Commande #{order.order_number} · <strong style={{ color: T.accent }}>
                {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
              </strong>
            </p>

            {payOk ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ color: T.green, display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <IcCheck size={40} color={T.green} />
                </div>
                <p style={{ color: T.green, fontWeight: 700, fontSize: 16 }}>Paiement confirmé !</p>
                <p style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>Passage aux avis…</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 12 }}>
                  Mode de paiement
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {PAY_MODES.map(({ id, label, Icon }) => {
                    const selected = payMode === id;
                    return (
                      <button key={id} onClick={() => setPayMode(id)} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '13px 16px', borderRadius: 12, cursor: 'pointer',
                        border: `1.5px solid ${selected ? T.accent : T.border}`,
                        background: selected ? `${T.accent}15` : T.surface,
                        fontFamily: font, textAlign: 'left',
                        transition: 'all .15s',
                      }}>
                        <span style={{ color: selected ? T.accent : T.muted }}>
                          <Icon size={22} />
                        </span>
                        <span style={{ color: selected ? T.accent : T.text, fontWeight: selected ? 700 : 500, fontSize: 14 }}>
                          {label}
                        </span>
                        {selected && (
                          <span style={{ marginLeft: 'auto', color: T.accent }}>
                            <IcCheck size={16} color={T.accent} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {payMsg && <p style={{ color: T.red, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{payMsg}</p>}

                <button onClick={payer} disabled={!payMode || paying} style={{
                  width: '100%', padding: 14, background: payMode ? T.accent : T.border,
                  color: payMode ? '#0A0C10' : T.muted, border: 'none', borderRadius: 13,
                  fontFamily: font, fontSize: 15, fontWeight: 800,
                  cursor: payMode && !paying ? 'pointer' : 'not-allowed',
                  transition: 'background .2s',
                }}>
                  {paying ? 'Traitement…' : `Payer ${Number(order.total_amount).toLocaleString('fr-FR')} FCFA`}
                </button>
              </>
            )}
          </>
        )}

        {/* ── ÉTAPE AVIS ── */}
        {step === 'avis' && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 4 }}>Votre avis</h2>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>
              Notez les plats de votre commande
            </p>

            {items.length === 0 && (
              <p style={{ color: T.muted, fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                Aucun plat à noter
              </p>
            )}

            {items.map((item, idx) => {
              const platId   = item.plat_id;
              const platName = item.plat_nom || item.name;
              const isSent   = sent[platId];
              const curNote  = notes[platId] || 0;
              const curHov   = hovered[platId] || 0;

              return (
                <div key={platId} style={{
                  background: T.surface, borderRadius: 14, padding: 14,
                  marginBottom: 12, border: `1px solid ${isSent ? T.green : T.border}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{platName}</p>
                    {isSent && (
                      <span style={{ color: T.green, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}>
                        <IcCheck size={14} color={T.green} /> Envoyé
                      </span>
                    )}
                  </div>

                  {!isSent && (
                    <>
                      {/* Étoiles */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        {[1,2,3,4,5].map(n => (
                          <button key={n}
                            onClick={() => setNotes(p => ({ ...p, [platId]: n }))}
                            onMouseEnter={() => setHovered(p => ({ ...p, [platId]: n }))}
                            onMouseLeave={() => setHovered(p => ({ ...p, [platId]: 0 }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                              transform: (curHov || curNote) >= n ? 'scale(1.15)' : 'scale(1)',
                              transition: 'transform .15s' }}>
                            <IcStar size={26} filled={(curHov || curNote) >= n} color={T.accent} />
                          </button>
                        ))}
                        {(curHov || curNote) > 0 && (
                          <span style={{ color: T.accent, fontSize: 12, fontWeight: 600, alignSelf: 'center', marginLeft: 4 }}>
                            {NOTE_LABELS[curHov || curNote]}
                          </span>
                        )}
                      </div>

                      {/* Commentaire */}
                      <textarea
                        value={comments[platId] || ''}
                        onChange={e => setComments(p => ({ ...p, [platId]: e.target.value }))}
                        placeholder="Commentaire (facultatif)…"
                        rows={2}
                        style={{
                          width: '100%', background: T.bg,
                          border: `1px solid ${T.border}`, borderRadius: 8,
                          color: T.text, fontFamily: font, fontSize: 12,
                          padding: '8px 10px', outline: 'none', resize: 'none',
                          marginBottom: 10, boxSizing: 'border-box',
                        }}
                      />

                      <button onClick={() => envoyerAvis(platId)} disabled={!curNote || sending} style={{
                        width: '100%', padding: '9px', background: curNote ? T.accent : T.border,
                        color: curNote ? '#0A0C10' : T.muted, border: 'none', borderRadius: 9,
                        fontFamily: font, fontSize: 13, fontWeight: 700,
                        cursor: curNote && !sending ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                        <IcStar size={14} color={curNote ? '#0A0C10' : T.muted} filled />
                        {sending ? 'Envoi…' : 'Envoyer cet avis'}
                      </button>
                    </>
                  )}
                </div>
              );
            })}

            {avisMsg && <p style={{ color: T.red, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{avisMsg}</p>}

            <button onClick={onDone} style={{
              width: '100%', padding: 14, marginTop: 8,
              background: toutEnvoye ? T.green : T.surface,
              color: toutEnvoye ? '#0A0C10' : T.sub,
              border: `1.5px solid ${toutEnvoye ? T.green : T.border}`,
              borderRadius: 13, fontFamily: font, fontSize: 15, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <IcCheck size={18} color={toutEnvoye ? '#0A0C10' : T.sub} />
              {toutEnvoye ? 'Merci, à bientôt !' : 'Terminer sans noter'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────
export default function SuiviCommande() {
  const { T } = useTheme();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [showPay,  setShowPay]  = useState(false);

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

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 30, height: 30, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: T.border, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <IcServe size={52} color={T.border} />
              </div>
              <p style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>Aucune commande en cours</p>
              <button onClick={() => navigate('/menu')} style={{
                background: T.accent, color: '#0A0C10', border: 'none',
                borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: font,
              }}>Commander</button>
            </div>
          )}

          {/* Sélecteur commandes */}
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
                    color: active ? T.accent : T.sub, fontSize: 12, fontWeight: 600, fontFamily: font,
                  }}>
                    #{o.order_number || o.id}
                    <span style={{ marginLeft: 6, color: cfg.color, fontSize: 10 }}>● {cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {selected && (() => {
            const cfg         = STATUS_LABEL[selected.status] || { label: selected.status, color: T.muted, bg: T.surface };
            const currentStep = stepIndex(selected.status);
            const isLivree    = ['SERVIE', 'CLOTUREE'].includes(selected.status);

            return (
              <div style={{ animation: 'fadeUp .3s ease' }}>

                {/* Card principale */}
                <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div>
                      <p style={{ color: T.text, fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
                        #{selected.order_number || selected.id}
                      </p>
                      <p style={{ color: T.muted, fontSize: 12 }}>
                        Table {selected.table_numero ?? selected.table_id}
                        {selected.opened_at ? ` · ${new Date(selected.opened_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                      </p>
                    </div>
                    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Barre progression */}
                  {!['CLOTUREE', 'ANNULEE'].includes(selected.status) && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
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
                                <Icon size={18} color={done ? (current ? '#0A0C10' : T.accent) : T.muted} />
                              </div>
                              <p style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.3, color: done ? T.accent : T.muted, fontWeight: done ? 700 : 400 }}>
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {/* Ligne */}
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

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                    <p style={{ color: T.accent, fontWeight: 800, fontSize: 17 }}>
                      Total : {Number(selected.total_amount || 0).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>

                {/* Articles */}
                <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
                  <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .7, marginBottom: 12 }}>
                    Détail de la commande
                  </p>
                  {(selected.items || []).length === 0 ? (
                    <p style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '10px 0' }}>Aucun article</p>
                  ) : (
                    (selected.items || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < selected.items.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ background: `${T.accent}20`, color: T.accent, fontWeight: 800, fontSize: 11, minWidth: 26, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ×{item.quantity}
                          </span>
                          <span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{item.plat_nom || item.name}</span>
                        </div>
                        <span style={{ color: T.sub, fontSize: 13 }}>
                          {(Number(item.unit_price) * item.quantity).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <IcNote color={T.accent} />
                    <p style={{ color: T.accent, fontSize: 13, lineHeight: 1.5 }}>{selected.notes}</p>
                  </div>
                )}

                {/* Bouton Payer après livraison */}
                {isLivree && selected.payment_status !== 'PAYE' && (
                  <button onClick={() => setShowPay(true)} style={{
                    width: '100%', padding: 14, background: T.accent,
                    color: '#0A0C10', border: 'none', borderRadius: 13,
                    fontFamily: font, fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10,
                  }}>
                    <IcCash size={20} /> Payer &amp; Donner mon avis
                  </button>
                )}

                {/* Déjà payé */}
                {isLivree && selected.payment_status === 'PAYE' && (
                  <div style={{ background: `${T.green}15`, border: `1px solid ${T.green}40`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                    <p style={{ color: T.green, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <IcCheck size={16} color={T.green} /> Commande payée
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal Paiement + Avis */}
      {showPay && selected && (
        <PayModal
          order={selected}
          T={T}
          onClose={() => setShowPay(false)}
          onDone={() => { setShowPay(false); navigate('/menu'); }}
        />
      )}
    </>
  );
}