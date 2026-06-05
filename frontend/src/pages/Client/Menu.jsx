import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const G = {
  bg: '#0A0C10', surface: '#11141C', card: '#181D28', border: '#252D3D',
  accent: '#F5A623', accentGlow: 'rgba(245,166,35,.15)', green: '#22D3A0',
  red: '#F56565', text: '#EEF0F4', sub: '#8B93A8', muted: '#4A526A',
  font: "'Sora','DM Sans',system-ui,sans-serif",
  fontDisplay: "'Bricolage Grotesque','Playfair Display',Georgia,serif",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body,#root{height:100%;background:${G.bg};}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:${G.bg};}
  ::-webkit-scrollbar-thumb{background:${G.border};border-radius:2px;}
  .dish-card{background:${G.card};border:1.5px solid ${G.border};border-radius:16px;overflow:hidden;transition:all .2s;cursor:pointer;}
  .dish-card:hover{border-color:${G.accent};transform:translateY(-2px);box-shadow:0 8px 32px rgba(245,166,35,.1);}
  .dish-card.unavailable{opacity:.45;cursor:not-allowed;}
  .cat-chip{padding:8px 16px;border-radius:20px;border:1.5px solid ${G.border};background:${G.surface};
    color:${G.sub};font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;white-space:nowrap;
    font-family:${G.font};}
  .cat-chip:hover{border-color:${G.accent};color:${G.text};}
  .cat-chip.active{background:${G.accent};border-color:${G.accent};color:#0A0C10;}
  .add-btn{width:32px;height:32px;border-radius:50%;border:none;background:${G.accent};
    color:#0A0C10;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-weight:700;transition:all .18s;flex-shrink:0;}
  .add-btn:hover{transform:scale(1.1);}
  .add-btn:disabled{background:${G.border};color:${G.muted};cursor:not-allowed;transform:none;}
  .search-input{width:100%;background:${G.surface};border:1.5px solid ${G.border};border-radius:12px;
    color:${G.text};font-family:${G.font};font-size:14px;padding:12px 14px 12px 40px;outline:none;transition:border-color .2s;}
  .search-input:focus{border-color:${G.accent};}
  .search-input::placeholder{color:${G.muted};}
  .allergen-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;
    border-radius:10px;background:rgba(245,101,101,.12);border:1px solid rgba(245,101,101,.25);
    color:#fca5a5;font-size:10px;font-family:${G.font};}
  .cart-fab{position:fixed;bottom:24px;right:20px;background:${G.accent};color:#0A0C10;
    border:none;border-radius:28px;padding:14px 22px;font-family:${G.font};font-size:15px;
    font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;
    box-shadow:0 8px 32px rgba(245,166,35,.35);transition:all .2s;z-index:100;}
  .cart-fab:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(245,166,35,.45);}
`;

const Spinner = () => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:60}}>
    <div style={{width:32,height:32,border:`3px solid ${G.border}`,borderTopColor:G.accent,
      borderRadius:'50%',animation:'spin .8s linear infinite'}} />
  </div>
);

const Stars = ({ note, size = 13 }) => {
  const n = Math.round(note || 0);
  return (
    <span style={{fontSize:size}}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{color: i<=n ? G.accent : G.muted}}>★</span>
      ))}
    </span>
  );
};

// Vérifie si un plat a des allergènes que l'utilisateur a déclarés
const hasUserAllergen = (dish, userAllergies) => {
  if (!userAllergies?.length || !dish.allergens?.length) return false;
  const userIds = userAllergies.map(a => a.id);
  return dish.allergens.some(a => userIds.includes(a.id));
};

export default function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dishes, setDishes]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('kp_cart') || '[]'); } catch { return []; }
  });
  const [activecat, setActiveCat] = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // dish detail

  // Charger catégories
  useEffect(() => {
    api.get('/api/dishes/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  // Charger plats
  const loadDishes = useCallback(() => {
    setLoading(true);
    const params = {};
    if (activecat) params.category = activecat;
    if (search)    params.search   = search;
    api.get('/api/dishes', { params })
      .then(r => setDishes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activecat, search]);

  useEffect(() => { loadDishes(); }, [loadDishes]);

  // Sync panier localStorage
  useEffect(() => {
    localStorage.setItem('kp_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (dish, e) => {
    e?.stopPropagation();
    if (!dish.is_active) return;
    setCart(prev => {
      const existing = prev.find(i => i.plat_id === dish.id);
      if (existing) return prev.map(i => i.plat_id === dish.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, { plat_id: dish.id, quantity: 1, name: dish.name, price: dish.price, image_url: dish.image_url }];
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const userAllergies = user?.allergies || [];

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh', background:G.bg, fontFamily:G.font, paddingBottom:100}}>

        {/* Navbar */}
        <div style={{background:G.surface, borderBottom:`1px solid ${G.border}`,
          padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
          position:'sticky', top:0, zIndex:50}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:22}}>🍴</span>
            <span style={{fontFamily:G.fontDisplay, fontSize:18, fontWeight:800, color:G.text}}>
              Kitchen<span style={{color:G.accent}}>Pulse</span>
            </span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{fontSize:13, color:G.sub}}>
              👋 {user?.first_name}
            </span>
            <button onClick={logout} style={{background:'transparent', border:`1px solid ${G.border}`,
              borderRadius:8, color:G.muted, fontSize:12, padding:'6px 12px', cursor:'pointer',
              fontFamily:G.font}}>
              Déco
            </button>
          </div>
        </div>

        <div style={{maxWidth:680, margin:'0 auto', padding:'20px 16px'}}>

          {/* Alerte allergènes */}
          {userAllergies.length > 0 && (
            <div style={{background:'rgba(245,166,35,.08)', border:`1px solid rgba(245,166,35,.2)`,
              borderRadius:12, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.accent,
              display:'flex', alignItems:'center', gap:8}}>
              ⚠️ Tes allergies ({userAllergies.map(a=>a.icon).join(' ')}) sont signalées sur les plats
            </div>
          )}

          {/* Search */}
          <div style={{position:'relative', marginBottom:16}}>
            <span style={{position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
              fontSize:16, color:G.muted}}>🔍</span>
            <input className="search-input" placeholder="Rechercher un plat…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Catégories */}
          <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:20}}>
            <span className={`cat-chip ${!activecat ? 'active' : ''}`}
              onClick={() => setActiveCat('')}>
              🍽️ Tout
            </span>
            {categories.map(c => (
              <span key={c.id} className={`cat-chip ${activecat===c.slug ? 'active' : ''}`}
                onClick={() => setActiveCat(activecat === c.slug ? '' : c.slug)}>
                {c.icon} {c.name}
              </span>
            ))}
          </div>

          {/* Plats */}
          {loading ? <Spinner /> : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:14}}>
              {dishes.length === 0 && (
                <div style={{gridColumn:'1/-1', textAlign:'center', color:G.muted, padding:40, fontSize:14}}>
                  Aucun plat trouvé
                </div>
              )}
              {dishes.map((dish, i) => {
                const warn = hasUserAllergen(dish, userAllergies);
                const cartItem = cart.find(c => c.plat_id === dish.id);
                return (
                  <div key={dish.id} className={`dish-card ${!dish.is_active ? 'unavailable' : ''}`}
                    style={{animation:`fadeUp .3s ease ${i*0.04}s both`}}
                    onClick={() => dish.is_active && setModal(dish)}>

                    {/* Image / Emoji */}
                    <div style={{height:130, background:G.surface,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      position:'relative', overflow:'hidden'}}>
                      {dish.image_url
                        ? <img src={dish.image_url} alt={dish.name}
                            style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        : <span style={{fontSize:52}}>{dish.category_icon || '🍽️'}</span>
                      }
                      {dish.is_featured && (
                        <span style={{position:'absolute', top:8, left:8, background:G.accent,
                          color:'#0A0C10', fontSize:10, fontWeight:700, padding:'3px 8px',
                          borderRadius:20}}>⭐ TOP</span>
                      )}
                      {warn && (
                        <span style={{position:'absolute', top:8, right:8, background:'rgba(245,101,101,.9)',
                          color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px',
                          borderRadius:20}}>⚠️ Allergie</span>
                      )}
                      {!dish.is_active && (
                        <div style={{position:'absolute', inset:0, background:'rgba(10,12,16,.7)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          color:G.muted, fontSize:12, fontWeight:600}}>
                          Indisponible
                        </div>
                      )}
                    </div>

                    <div style={{padding:14}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
                        <div style={{flex:1}}>
                          <p style={{color:G.text, fontWeight:600, fontSize:14, marginBottom:2, lineHeight:1.3}}>
                            {dish.name}
                          </p>
                          <p style={{color:G.muted, fontSize:11, lineHeight:1.4, marginBottom:6,
                            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                            {dish.description}
                          </p>
                        </div>
                      </div>

                      {/* Allergènes */}
                      {dish.allergens?.length > 0 && (
                        <div style={{display:'flex', flexWrap:'wrap', gap:4, marginBottom:8}}>
                          {dish.allergens.slice(0,3).map(a => (
                            <span key={a.id} className="allergen-tag">{a.icon} {a.code}</span>
                          ))}
                          {dish.allergens.length > 3 && (
                            <span className="allergen-tag">+{dish.allergens.length-3}</span>
                          )}
                        </div>
                      )}

                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <div>
                          <p style={{color:G.accent, fontWeight:700, fontSize:16}}>
                            {Number(dish.price).toLocaleString('fr-FR')} FCFA
                          </p>
                          <div style={{display:'flex', alignItems:'center', gap:5, marginTop:2}}>
                            <Stars note={dish.note_moyenne} />
                            <span style={{color:G.muted, fontSize:11}}>
                              ({dish.nb_avis || 0})
                            </span>
                            {dish.prep_time_minutes && (
                              <span style={{color:G.muted, fontSize:11}}>· ⏱ {dish.prep_time_minutes}min</span>
                            )}
                          </div>
                        </div>

                        {cartItem ? (
                          <div style={{display:'flex', alignItems:'center', gap:8}}>
                            <button onClick={e => { e.stopPropagation(); setCart(prev =>
                              prev.map(i => i.plat_id===dish.id
                                ? i.quantity===1 ? null : {...i, quantity:i.quantity-1}
                                : i).filter(Boolean)
                            );}} style={{...btnStyle, background:G.border}}>−</button>
                            <span style={{color:G.text, fontWeight:700, fontSize:14, minWidth:16, textAlign:'center'}}>
                              {cartItem.quantity}
                            </span>
                            <button className="add-btn" onClick={e => addToCart(dish, e)}>+</button>
                          </div>
                        ) : (
                          <button className="add-btn" disabled={!dish.is_active}
                            onClick={e => addToCart(dish, e)}>+</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FAB Panier */}
        {cartCount > 0 && (
          <button className="cart-fab" onClick={() => navigate('/panier')}>
            🛒 Mon panier
            <span style={{background:'#0A0C10', color:G.accent, borderRadius:20,
              padding:'2px 8px', fontSize:13, fontWeight:700}}>
              {cartCount}
            </span>
            <span style={{fontSize:13}}>· {cartTotal.toLocaleString('fr-FR')} FCFA</span>
          </button>
        )}

        {/* Modal détail plat */}
        {modal && <DishModal dish={modal} onClose={() => setModal(null)}
          onAdd={() => addToCart(modal)} cart={cart} userAllergies={userAllergies} />}
      </div>
    </>
  );
}

const btnStyle = {
  width:32, height:32, borderRadius:'50%', border:'none', color:G.text,
  fontSize:18, cursor:'pointer', display:'flex', alignItems:'center',
  justifyContent:'center', fontWeight:700, transition:'all .18s'
};

/* ─── Modal détail plat ─── */
function DishModal({ dish, onClose, onAdd, cart, userAllergies }) {
  const [reviews, setReviews] = useState([]);
  const cartItem = cart.find(c => c.plat_id === dish.id);
  const warn = !!(userAllergies?.length && dish.allergens?.some(
    a => userAllergies.map(u=>u.id).includes(a.id)
  ));

  useEffect(() => {
    api.get(`/api/reviews/${dish.id}`).then(r => setReviews(r.data)).catch(() => {});
  }, [dish.id]);

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(10,12,16,.85)', zIndex:200,
      display:'flex', alignItems:'flex-end', justifyContent:'center'}}
      onClick={onClose}>
      <div style={{background:G.card, border:`1px solid ${G.border}`, borderRadius:'20px 20px 0 0',
        width:'100%', maxWidth:500, maxHeight:'85vh', overflowY:'auto', padding:24,
        animation:'fadeUp .3s ease'}}
        onClick={e => e.stopPropagation()}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
          <div>
            <h2 style={{fontFamily:G.fontDisplay, fontSize:22, color:G.text, marginBottom:4}}>{dish.name}</h2>
            <p style={{color:G.muted, fontSize:12}}>{dish.category_name}</p>
          </div>
          <button onClick={onClose} style={{background:G.surface, border:`1px solid ${G.border}`,
            color:G.muted, borderRadius:8, padding:'6px 10px', cursor:'pointer', fontFamily:G.font}}>✕</button>
        </div>

        {warn && (
          <div style={{background:'rgba(245,101,101,.1)', border:'1px solid rgba(245,101,101,.3)',
            borderRadius:10, padding:'8px 12px', marginBottom:14, color:'#fca5a5', fontSize:12}}>
            ⚠️ Ce plat contient des allergènes que tu as déclarés !
          </div>
        )}

        <p style={{color:G.sub, fontSize:13, lineHeight:1.6, marginBottom:16}}>{dish.description}</p>

        {/* Allergènes */}
        {dish.allergens?.length > 0 && (
          <div style={{marginBottom:16}}>
            <p style={{fontSize:11, color:G.muted, fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:.6}}>Allergènes</p>
            <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
              {dish.allergens.map(a => (
                <span key={a.id} style={{background:G.surface, border:`1px solid ${G.border}`,
                  borderRadius:20, padding:'4px 10px', fontSize:12, color:G.sub}}>
                  {a.icon} {a.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Avis */}
        {reviews.length > 0 && (
          <div style={{marginBottom:20}}>
            <p style={{fontSize:11, color:G.muted, fontWeight:600, marginBottom:10, textTransform:'uppercase', letterSpacing:.6}}>
              Avis récents
            </p>
            {reviews.slice(0,3).map((r, i) => (
              <div key={i} style={{background:G.surface, borderRadius:10, padding:'10px 12px',
                marginBottom:8, border:`1px solid ${G.border}`}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                  <span style={{fontSize:12, color:G.text, fontWeight:600}}>
                    {r.first_name} {r.last_name[0]}.
                    {r.is_verified_purchase ? <span style={{color:G.green, marginLeft:6, fontSize:10}}>✓ achat vérifié</span> : null}
                  </span>
                  <span style={{fontSize:12}}>{'★'.repeat(r.note)}{'☆'.repeat(5-r.note)}</span>
                </div>
                {r.commentaire && <p style={{fontSize:12, color:G.sub}}>{r.commentaire}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Prix + Ajouter */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between',
          borderTop:`1px solid ${G.border}`, paddingTop:16}}>
          <div>
            <p style={{color:G.accent, fontWeight:700, fontSize:22}}>
              {Number(dish.price).toLocaleString('fr-FR')} FCFA
            </p>
            {dish.prep_time_minutes && (
              <p style={{color:G.muted, fontSize:12}}>⏱ {dish.prep_time_minutes} min</p>
            )}
          </div>
          <button onClick={onAdd} style={{background:G.accent, color:'#0A0C10', border:'none',
            borderRadius:12, padding:'12px 24px', fontSize:15, fontWeight:700, cursor:'pointer',
            fontFamily:G.font}}>
            {cartItem ? `Ajouter (${cartItem.quantity})` : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </div>
  );
}