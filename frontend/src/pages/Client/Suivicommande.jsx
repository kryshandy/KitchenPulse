import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const G = {
  bg:'#0A0C10', surface:'#11141C', card:'#181D28', border:'#252D3D',
  accent:'#F5A623', green:'#22D3A0', red:'#F56565',
  text:'#EEF0F4', sub:'#8B93A8', muted:'#4A526A',
  font:"'Sora','DM Sans',system-ui,sans-serif",
  fontDisplay:"'Bricolage Grotesque','Playfair Display',Georgia,serif",
};

const STATUTS = {
  RECUE:             { label:'Commande reçue',       icon:'📥', color:'#60A5FA', step:1 },
  EN_PREPARATION:    { label:'En préparation',        icon:'👨‍🍳', color:G.accent,  step:2 },
  PRETE:             { label:'Prête !',               icon:'✅', color:G.green,   step:3 },
  EN_COURS_DE_SERVICE:{ label:'En cours de service',  icon:'🤵', color:'#A78BFA', step:4 },
  SERVIE:            { label:'Servie',                icon:'🍽️', color:G.green,   step:5 },
  CLOTUREE:          { label:'Terminée',              icon:'✓',  color:G.muted,   step:6 },
  ANNULEE:           { label:'Annulée',               icon:'✕',  color:G.red,     step:0 },
};

const STEPS = ['RECUE','EN_PREPARATION','PRETE','EN_COURS_DE_SERVICE','SERVIE'];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body,#root{height:100%;background:${G.bg};}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(.95);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes kpPing{0%{transform:scale(1);opacity:1;}75%,100%{transform:scale(1.8);opacity:0;}}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:${G.bg};}
  ::-webkit-scrollbar-thumb{background:${G.border};border-radius:2px;}
  .star-btn{background:transparent;border:2px solid ${G.border};border-radius:8px;
    width:40px;height:40px;font-size:20px;cursor:pointer;transition:all .15s;display:flex;
    align-items:center;justify-content:center;}
  .star-btn:hover,.star-btn.active{border-color:${G.accent};background:rgba(245,166,35,.12);}
  .submit-btn{width:100%;padding:13px;background:${G.accent};color:#0A0C10;border:none;
    border-radius:12px;font-family:${G.font};font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;}
  .submit-btn:hover:not(:disabled){transform:translateY(-1px);}
  .submit-btn:disabled{opacity:.5;cursor:not-allowed;}
  .field-input{width:100%;background:${G.surface};border:1.5px solid ${G.border};border-radius:10px;
    color:${G.text};font-family:${G.font};font-size:14px;padding:11px 13px;outline:none;transition:border-color .2s;}
  .field-input:focus{border-color:${G.accent};}
  .field-input::placeholder{color:${G.muted};}
`;

const LiveDot = ({ color = G.green }) => (
  <span style={{position:'relative', display:'inline-flex', width:10, height:10}}>
    <span style={{position:'absolute', inset:0, borderRadius:'50%', background:color,
      animation:'kpPing 1.4s ease infinite', opacity:.4}} />
    <span style={{position:'relative', width:10, height:10, borderRadius:'50%', background:color}} />
  </span>
);

export default function SuiviCommande() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [myOrders, setMyOrders] = useState([]);

  // Avis
  const [selectedDish, setSelectedDish] = useState(null);
  const [note, setNote]         = useState(0);
  const [commentaire, setComment] = useState('');
  const [reviewSent, setReviewSent] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg]   = useState('');

  const loadOrder = useCallback(() => {
    if (!orderId) return;
    api.get(`/api/orders/${orderId}`)
      .then(r => { setOrder(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  // Polling toutes les 5s
  useEffect(() => {
    loadOrder();
    const iv = setInterval(loadOrder, 5000);
    return () => clearInterval(iv);
  }, [loadOrder]);

  // Mes commandes récentes (si pas d'orderId)
  useEffect(() => {
    if (!orderId) {
      api.get('/api/orders').then(r => setMyOrders(r.data)).catch(() => {});
      setLoading(false);
    }
  }, [orderId]);

  const handleReview = async (platId) => {
    if (!note) return;
    setSubmitting(true); setReviewMsg('');
    try {
      await api.post('/api/reviews', { plat_id: platId, note, commentaire });
      setReviewSent(prev => ({ ...prev, [platId]: true }));
      setReviewMsg('Avis envoyé, merci !');
      setNote(0); setComment(''); setSelectedDish(null);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = order ? (STATUTS[order.status] || STATUTS.RECUE) : null;
  const currentStep = statusInfo?.step || 1;

  // ── Pas d'orderId → liste mes commandes ──
  if (!orderId) {
    return (
      <>
        <style>{css}</style>
        <div style={{minHeight:'100vh', background:G.bg, fontFamily:G.font}}>
          <div style={{background:G.surface, borderBottom:`1px solid ${G.border}`,
            padding:'14px 20px', display:'flex', alignItems:'center', gap:12}}>
            <button onClick={() => navigate('/menu')} style={{background:'transparent',
              border:`1px solid ${G.border}`, borderRadius:8, color:G.sub,
              padding:'7px 12px', cursor:'pointer', fontFamily:G.font, fontSize:13}}>
              ← Menu
            </button>
            <h1 style={{fontFamily:G.fontDisplay, fontSize:18, color:G.text}}>Mes commandes</h1>
          </div>
          <div style={{maxWidth:500, margin:'0 auto', padding:'20px 16px'}}>
            {myOrders.length === 0
              ? <p style={{color:G.muted, textAlign:'center', padding:40}}>Aucune commande</p>
              : myOrders.map(o => {
                  const s = STATUTS[o.status] || STATUTS.RECUE;
                  return (
                    <div key={o.id} onClick={() => navigate(`/suivi/${o.id}`)}
                      style={{background:G.card, border:`1px solid ${G.border}`, borderRadius:14,
                        padding:16, marginBottom:10, cursor:'pointer', transition:'border-color .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=G.accent}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                        <span style={{color:G.text, fontWeight:600, fontSize:14}}>{o.order_number}</span>
                        <span style={{color:s.color, fontSize:13, fontWeight:600}}>{s.icon} {s.label}</span>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span style={{color:G.muted, fontSize:12}}>
                          Table {o.table_number} · {new Date(o.opened_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span style={{color:G.accent, fontWeight:700, fontSize:13}}>
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
      <style>{css}</style>
      <div style={{minHeight:'100vh', background:G.bg, display:'flex', alignItems:'center',
        justifyContent:'center', flexDirection:'column', gap:16}}>
        <div style={{width:36, height:36, border:`3px solid ${G.border}`,
          borderTopColor:G.accent, borderRadius:'50%', animation:'spin .8s linear infinite'}} />
        <p style={{color:G.muted, fontFamily:G.font, fontSize:14}}>Chargement de ta commande…</p>
      </div>
    </>
  );

  if (!order) return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh', background:G.bg, display:'flex', alignItems:'center',
        justifyContent:'center', flexDirection:'column', gap:16}}>
        <p style={{color:G.muted, fontFamily:G.font}}>Commande introuvable</p>
        <button onClick={() => navigate('/menu')} style={{background:G.accent, color:'#0A0C10',
          border:'none', borderRadius:10, padding:'10px 20px', cursor:'pointer', fontFamily:G.font, fontWeight:700}}>
          Retour au menu
        </button>
      </div>
    </>
  );

  const isServed = ['SERVIE','CLOTUREE'].includes(order.status);

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh', background:G.bg, fontFamily:G.font, paddingBottom:60}}>

        {/* Header */}
        <div style={{background:G.surface, borderBottom:`1px solid ${G.border}`,
          padding:'14px 20px', display:'flex', alignItems:'center', gap:12,
          position:'sticky', top:0, zIndex:50}}>
          <button onClick={() => navigate('/menu')} style={{background:'transparent',
            border:`1px solid ${G.border}`, borderRadius:8, color:G.sub,
            padding:'7px 12px', cursor:'pointer', fontFamily:G.font, fontSize:13}}>
            ← Menu
          </button>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:G.fontDisplay, fontSize:16, color:G.text}}>{order.order_number}</h1>
            <p style={{color:G.muted, fontSize:11}}>Table {order.table_number}</p>
          </div>
          {!isServed && <LiveDot />}
        </div>

        <div style={{maxWidth:500, margin:'0 auto', padding:'24px 16px'}}>

          {/* Statut principal */}
          <div style={{background:G.card, border:`1.5px solid ${statusInfo.color}30`,
            borderRadius:18, padding:24, marginBottom:20, textAlign:'center',
            animation:'fadeUp .4s ease'}}>
            <div style={{fontSize:52, marginBottom:12, animation: !isServed ? 'pulse 2s ease infinite' : 'none'}}>
              {statusInfo.icon}
            </div>
            <h2 style={{fontFamily:G.fontDisplay, fontSize:22, color:statusInfo.color, marginBottom:6}}>
              {statusInfo.label}
            </h2>
            <p style={{color:G.sub, fontSize:13}}>
              Mise à jour : {new Date(order.updated_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
            </p>
            {!isServed && (
              <p style={{color:G.muted, fontSize:12, marginTop:6}}>
                Actualisation automatique toutes les 5 secondes
              </p>
            )}
          </div>

          {/* Barre de progression */}
          {order.status !== 'ANNULEE' && (
            <div style={{background:G.card, border:`1px solid ${G.border}`, borderRadius:14,
              padding:16, marginBottom:20, animation:'fadeUp .4s ease .1s both'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                {STEPS.map((s, i) => {
                  const info = STATUTS[s];
                  const done = currentStep > i + 1;
                  const current = currentStep === i + 1;
                  return (
                    <div key={s} style={{display:'flex', flexDirection:'column', alignItems:'center', flex:1}}>
                      {/* Connecteur */}
                      {i > 0 && (
                        <div style={{position:'relative', width:'100%', height:2, background:G.border,
                          marginBottom:8}}>
                          <div style={{position:'absolute', inset:0, background:G.accent,
                            transition:'transform .5s ease', transformOrigin:'left',
                            transform:`scaleX(${done || current ? 1 : 0})`}} />
                        </div>
                      )}
                      {/* Icône */}
                      <div style={{width:32, height:32, borderRadius:'50%',
                        background: done ? G.accent : current ? `${info.color}25` : G.surface,
                        border: `2px solid ${done || current ? info.color : G.border}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:14, marginBottom:4, transition:'all .3s'}}>
                        {done ? '✓' : info.icon}
                      </div>
                      <span style={{fontSize:9, color: current ? info.color : G.muted,
                        textAlign:'center', lineHeight:1.2, fontWeight: current ? 700 : 400,
                        maxWidth:52}}>
                        {info.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Articles commandés */}
          <div style={{background:G.card, border:`1px solid ${G.border}`, borderRadius:14,
            padding:16, marginBottom:20, animation:'fadeUp .4s ease .2s both'}}>
            <p style={{fontSize:11, color:G.muted, fontWeight:600, marginBottom:12,
              textTransform:'uppercase', letterSpacing:.7}}>Ta commande</p>
            {order.items?.map(item => (
              <div key={item.id} style={{display:'flex', justifyContent:'space-between',
                alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${G.border}`}}>
                <div style={{flex:1}}>
                  <p style={{color:G.text, fontSize:13, fontWeight:500}}>{item.name}</p>
                  <p style={{color:G.muted, fontSize:11}}>×{item.quantity}</p>
                </div>
                <p style={{color:G.accent, fontSize:13, fontWeight:700}}>
                  {Number(item.subtotal).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
            <div style={{display:'flex', justifyContent:'space-between', paddingTop:10}}>
              <span style={{color:G.text, fontWeight:700}}>Total</span>
              <span style={{color:G.accent, fontWeight:700, fontSize:16}}>
                {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Section avis — disponible si servi */}
          {isServed && (
            <div style={{animation:'fadeUp .4s ease .3s both'}}>
              <p style={{fontSize:11, color:G.muted, fontWeight:600, marginBottom:12,
                textTransform:'uppercase', letterSpacing:.7}}>Laisser un avis</p>
              {order.items?.map(item => (
                <div key={item.id} style={{background:G.card, border:`1px solid ${G.border}`,
                  borderRadius:14, padding:16, marginBottom:10}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                    <p style={{color:G.text, fontWeight:600, fontSize:13}}>{item.name}</p>
                    {reviewSent[item.plat_id] && (
                      <span style={{color:G.green, fontSize:12, fontWeight:600}}>✓ Avis envoyé</span>
                    )}
                  </div>

                  {!reviewSent[item.plat_id] && (
                    <>
                      {selectedDish === item.plat_id ? (
                        <div>
                          {/* Étoiles */}
                          <div style={{display:'flex', gap:8, marginBottom:12}}>
                            {[1,2,3,4,5].map(n => (
                              <button key={n} className={`star-btn ${note>=n?'active':''}`}
                                onClick={() => setNote(n)}>
                                {note >= n ? '⭐' : '☆'}
                              </button>
                            ))}
                          </div>
                          {/* Commentaire */}
                          <textarea className="field-input" value={commentaire}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Ton avis sur ce plat… (facultatif)"
                            rows={3} style={{resize:'vertical', marginBottom:10}} />
                          {reviewMsg && (
                            <p style={{color:reviewMsg.includes('merci') ? G.green : G.red,
                              fontSize:12, marginBottom:8}}>{reviewMsg}</p>
                          )}
                          <div style={{display:'flex', gap:8}}>
                            <button className="submit-btn" disabled={!note || submitting}
                              onClick={() => handleReview(item.plat_id)}
                              style={{flex:2}}>
                              {submitting ? 'Envoi…' : 'Envoyer mon avis'}
                            </button>
                            <button onClick={() => { setSelectedDish(null); setNote(0); setComment(''); }}
                              style={{flex:1, background:G.surface, border:`1px solid ${G.border}`,
                                borderRadius:12, color:G.sub, cursor:'pointer', fontFamily:G.font,
                                fontSize:13, fontWeight:600}}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedDish(item.plat_id)}
                          style={{background:G.surface, border:`1px solid ${G.border}`,
                            borderRadius:10, padding:'8px 16px', color:G.sub, cursor:'pointer',
                            fontFamily:G.font, fontSize:13, fontWeight:600, transition:'all .18s'}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=G.accent;e.currentTarget.style.color=G.accent;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.color=G.sub;}}>
                          ★ Noter ce plat
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bouton retour menu */}
          <button onClick={() => navigate('/menu')}
            style={{width:'100%', padding:12, background:'transparent',
              border:`1.5px solid ${G.border}`, borderRadius:12, color:G.sub,
              cursor:'pointer', fontFamily:G.font, fontSize:14, fontWeight:600,
              marginTop:8, transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=G.accent;e.currentTarget.style.color=G.accent;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.color=G.sub;}}>
            ← Retour au menu
          </button>
        </div>
      </div>
    </>
  );
}