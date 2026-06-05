import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

/* ─── Thème ─── */
const dark = {
  bg:'#0A0C10', surface:'#11141C', card:'#181D28', border:'#252D3D',
  accent:'#F5A623', accentGlow:'rgba(245,166,35,.15)', green:'#22D3A0',
  red:'#F56565', text:'#EEF0F4', sub:'#8B93A8', muted:'#4A526A',
  shadow:'0 4px 24px rgba(0,0,0,.5)', navBg:'#0E1118',
};
const light = {
  bg:'#F5F6FA', surface:'#FFFFFF', card:'#FFFFFF', border:'#E2E6EF',
  accent:'#F5A623', accentGlow:'rgba(245,166,35,.12)', green:'#16A37F',
  red:'#E53E3E', text:'#1A1D2E', sub:'#5A6282', muted:'#9BA3BC',
  shadow:'0 4px 24px rgba(0,0,0,.08)', navBg:'#FFFFFF',
};

const font  = "'Sora','DM Sans',system-ui,sans-serif";
const fontD = "'Bricolage Grotesque','Playfair Display',Georgia,serif";

const makeCss = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body,#root{height:100%;background:${T.bg};}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes ping{0%{transform:scale(1);opacity:1;}75%,100%{transform:scale(1.8);opacity:0;}}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:${T.bg};}
  ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}

  .dish-card{background:${T.card};border:1.5px solid ${T.border};border-radius:16px;
    overflow:hidden;transition:all .2s;cursor:pointer;box-shadow:${T.shadow};}
  .dish-card:hover{border-color:${T.accent};transform:translateY(-2px);}
  .dish-card.unavail{opacity:.42;cursor:not-allowed;}

  .cat-chip{padding:8px 16px;border-radius:20px;border:1.5px solid ${T.border};
    background:${T.surface};color:${T.sub};font-size:13px;font-weight:600;
    cursor:pointer;transition:all .18s;white-space:nowrap;font-family:${font};}
  .cat-chip:hover{border-color:${T.accent};color:${T.text};}
  .cat-chip.act{background:${T.accent};border-color:${T.accent};color:#0A0C10;}

  .qty-btn{width:28px;height:28px;border-radius:8px;border:1.5px solid ${T.border};
    background:${T.surface};color:${T.text};font-size:16px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;font-weight:700;
    transition:all .15s;font-family:${font};}
  .qty-btn:hover{border-color:${T.accent};}

  .search-input{width:100%;background:${T.surface};border:1.5px solid ${T.border};
    border-radius:12px;color:${T.text};font-family:${font};font-size:14px;
    padding:12px 14px 12px 40px;outline:none;transition:border-color .2s;}
  .search-input:focus{border-color:${T.accent};}
  .search-input::placeholder{color:${T.muted};}

  .nav-bar{position:fixed;bottom:0;left:0;right:0;background:${T.navBg};
    border-top:1px solid ${T.border};display:flex;z-index:100;
    box-shadow:0 -4px 20px rgba(0,0,0,.12);}
  .nav-item{flex:1;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:4px;padding:10px 4px;cursor:pointer;
    color:${T.muted};font-size:10px;font-weight:600;font-family:${font};
    transition:color .18s;border:none;background:transparent;position:relative;}
  .nav-item.act{color:${T.accent};}
  .nav-badge{position:absolute;top:6px;right:calc(50% - 14px);background:${T.accent};
    color:#0A0C10;border-radius:10px;font-size:10px;font-weight:700;
    padding:1px 5px;min-width:16px;text-align:center;}

  .allergen-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;
    border-radius:10px;background:rgba(245,101,101,.1);border:1px solid rgba(245,101,101,.2);
    color:#fca5a5;font-size:10px;font-family:${font};}

  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;
    display:flex;align-items:flex-end;justify-content:center;}
  .modal-sheet{background:${T.card};border:1px solid ${T.border};
    border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:90vh;
    overflow-y:auto;animation:fadeUp .3s ease;}
  .theme-toggle{background:${T.surface};border:1.5px solid ${T.border};
    border-radius:20px;padding:6px 12px;cursor:pointer;font-size:13px;
    color:${T.sub};font-family:${font};display:flex;align-items:center;gap:6px;
    transition:all .18s;}
  .theme-toggle:hover{border-color:${T.accent};}

  .mod-chip{padding:5px 12px;border-radius:16px;border:1.5px solid ${T.border};
    background:${T.surface};color:${T.sub};font-size:12px;cursor:pointer;
    transition:all .15s;font-family:${font};}
  .mod-chip.sel{background:${T.accentGlow};border-color:${T.accent};color:${T.accent};}
  .field-ta{width:100%;background:${T.surface};border:1.5px solid ${T.border};
    border-radius:10px;color:${T.text};font-family:${font};font-size:13px;
    padding:10px 12px;outline:none;resize:vertical;transition:border-color .2s;}
  .field-ta:focus{border-color:${T.accent};}
  .field-ta::placeholder{color:${T.muted};}
  .add-btn-main{background:${T.accent};color:#0A0C10;border:none;border-radius:12px;
    padding:12px 24px;font-family:${font};font-size:15px;font-weight:700;
    cursor:pointer;transition:all .2s;}
  .add-btn-main:hover{opacity:.9;transform:translateY(-1px);}
`;

const Stars = ({ note, size=13, T }) => (
  <span style={{fontSize:size}}>
    {[1,2,3,4,5].map(i=>(
      <span key={i} style={{color:i<=Math.round(note||0)?T.accent:T.muted}}>★</span>
    ))}
  </span>
);

const MODS = [
  'Pas trop épicé','Très épicé','Sans sel','Sans carottes','Sans oignons',
  'Sans tomates','Sauce à part','Bien cuit','Saignant','Sans gluten','Végétarien',
];

export default function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const T = isDark ? dark : light;
  const css = makeCss(T);

  const [dishes, setDishes]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart]           = useState(()=>{
    try{return JSON.parse(localStorage.getItem('kp_cart')||'[]');}catch{return[];}
  });
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);

  useEffect(()=>{
    api.get('/api/dishes/categories').then(r=>setCategories(r.data)).catch(()=>{});
  },[]);

  const loadDishes = useCallback(()=>{
    setLoading(true);
    const p={};
    if(activeCat) p.category=activeCat;
    if(search)    p.search=search;
    api.get('/api/dishes',{params:p})
      .then(r=>setDishes(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[activeCat,search]);

  useEffect(()=>{ loadDishes(); },[loadDishes]);
  useEffect(()=>{ localStorage.setItem('kp_cart',JSON.stringify(cart)); },[cart]);

  const getQty = (id) => cart.find(i=>i.plat_id===id)?.quantity || 0;

  const setQty = (dish, delta) => {
    setCart(prev=>{
      const ex = prev.find(i=>i.plat_id===dish.id);
      if(!ex && delta>0) return [...prev,{plat_id:dish.id,quantity:1,name:dish.name,price:dish.price,mods:[],note:''}];
      if(!ex) return prev;
      const nq = ex.quantity + delta;
      if(nq<=0) return prev.filter(i=>i.plat_id!==dish.id);
      return prev.map(i=>i.plat_id===dish.id?{...i,quantity:nq}:i);
    });
  };

  const openModal = (dish) => { if(dish.is_active) setModal({...dish, selMods:[], note:''}); };

  const addFromModal = () => {
    const dish = modal;
    setCart(prev=>{
      const ex = prev.find(i=>i.plat_id===dish.id);
      if(ex) return prev.map(i=>i.plat_id===dish.id
        ?{...i,quantity:i.quantity+1,mods:dish.selMods,note:dish.note}:i);
      return [...prev,{plat_id:dish.id,quantity:1,name:dish.name,price:dish.price,
        mods:dish.selMods||[],note:dish.note||''}];
    });
    setModal(null);
  };

  const cartCount = cart.reduce((s,i)=>s+i.quantity,0);
  const userAllergies = user?.allergies||[];

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:T.bg,fontFamily:font,paddingBottom:80}}>

        {/* Navbar top */}
        <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,
          padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',
          position:'sticky',top:0,zIndex:50,boxShadow:T.shadow}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:20}}>🍴</span>
            <span style={{fontFamily:fontD,fontSize:17,fontWeight:800,color:T.text}}>
              Kitchen<span style={{color:T.accent}}>Pulse</span>
            </span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button className="theme-toggle" onClick={()=>setIsDark(d=>!d)}>
              {isDark?'☀️ Clair':'🌙 Sombre'}
            </button>
            <span style={{fontSize:12,color:T.sub}}>👋 {user?.first_name}</span>
          </div>
        </div>

        <div style={{maxWidth:680,margin:'0 auto',padding:'16px 14px'}}>

          {userAllergies.length>0&&(
            <div style={{background:isDark?'rgba(245,166,35,.08)':'#FFF8ED',
              border:`1px solid rgba(245,166,35,.25)`,borderRadius:10,
              padding:'8px 12px',marginBottom:12,fontSize:12,color:T.accent}}>
              ⚠️ Tes allergies ({userAllergies.map(a=>a.icon).join(' ')}) sont signalées sur les plats
            </div>
          )}

          {/* Search */}
          <div style={{position:'relative',marginBottom:12}}>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',
              fontSize:15,color:T.muted}}>🔍</span>
            <input className="search-input" placeholder="Rechercher un plat…"
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>

          {/* Catégories */}
          <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:8,marginBottom:16}}>
            <span className={`cat-chip ${!activeCat?'act':''}`} onClick={()=>setActiveCat('')}>🍽️ Tout</span>
            {categories.map(c=>(
              <span key={c.id} className={`cat-chip ${activeCat===c.slug?'act':''}`}
                onClick={()=>setActiveCat(activeCat===c.slug?'':c.slug)}>
                {c.icon} {c.name}
              </span>
            ))}
          </div>

          {/* Grille plats */}
          {loading?(
            <div style={{display:'flex',justifyContent:'center',padding:60}}>
              <div style={{width:32,height:32,border:`3px solid ${T.border}`,
                borderTopColor:T.accent,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:12}}>
              {dishes.length===0&&(
                <div style={{gridColumn:'1/-1',textAlign:'center',color:T.muted,padding:40,fontSize:14}}>
                  Aucun plat trouvé
                </div>
              )}
              {dishes.map((dish,i)=>{
                const warn = userAllergies.length&&dish.allergens?.some(a=>userAllergies.map(u=>u.id).includes(a.id));
                const qty  = getQty(dish.id);
                return (
                  <div key={dish.id} className={`dish-card ${!dish.is_active?'unavail':''}`}
                    style={{animation:`fadeUp .3s ease ${i*.04}s both`}}
                    onClick={()=>openModal(dish)}>

                    <div style={{height:120,background:T.surface,display:'flex',
                      alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
                      {dish.image_url
                        ?<img src={dish.image_url} alt={dish.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        :<span style={{fontSize:48}}>{dish.category_icon||'🍽️'}</span>}
                      {dish.is_featured&&(
                        <span style={{position:'absolute',top:7,left:7,background:T.accent,
                          color:'#0A0C10',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20}}>⭐ TOP</span>)}
                      {warn&&(
                        <span style={{position:'absolute',top:7,right:7,background:'rgba(245,101,101,.9)',
                          color:'#fff',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20}}>⚠️ Allergie</span>)}
                      {!dish.is_active&&(
                        <div style={{position:'absolute',inset:0,background:'rgba(10,12,16,.65)',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          color:T.muted,fontSize:12,fontWeight:600}}>Indisponible</div>)}
                    </div>

                    <div style={{padding:12}}>
                      <p style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:2}}>{dish.name}</p>
                      <p style={{color:T.muted,fontSize:11,lineHeight:1.4,marginBottom:6,
                        display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                        {dish.description}
                      </p>
                      {dish.allergens?.length>0&&(
                        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
                          {dish.allergens.slice(0,2).map(a=>(
                            <span key={a.id} className="allergen-tag">{a.icon} {a.code}</span>
                          ))}
                          {dish.allergens.length>2&&<span className="allergen-tag">+{dish.allergens.length-2}</span>}
                        </div>
                      )}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div>
                          <p style={{color:T.accent,fontWeight:700,fontSize:15}}>
                            {Number(dish.price).toLocaleString('fr-FR')} FCFA
                          </p>
                          <div style={{display:'flex',alignItems:'center',gap:4,marginTop:1}}>
                            <Stars note={dish.note_moyenne} size={11} T={T}/>
                            <span style={{color:T.muted,fontSize:10}}>({dish.nb_avis||0})</span>
                          </div>
                        </div>
                        {/* Contrôle quantité */}
                        <div onClick={e=>e.stopPropagation()} style={{display:'flex',alignItems:'center',gap:6}}>
                          {qty>0?(
                            <>
                              <button className="qty-btn" onClick={()=>setQty(dish,-1)}>−</button>
                              <span style={{color:T.text,fontWeight:700,fontSize:14,minWidth:18,textAlign:'center'}}>{qty}</span>
                              <button className="qty-btn"
                                style={{background:T.accent,borderColor:T.accent,color:'#0A0C10'}}
                                onClick={()=>setQty(dish,+1)}>+</button>
                            </>
                          ):(
                            <button className="qty-btn"
                              style={{background:T.accent,borderColor:T.accent,color:'#0A0C10',
                                width:32,height:32,fontSize:20}}
                              disabled={!dish.is_active}
                              onClick={()=>setQty(dish,+1)}>+</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Navbar bottom */}
        <nav className="nav-bar">
          <button className="nav-item act">
            <span style={{fontSize:20}}>🍽️</span> Menu
          </button>
          <button className="nav-item" onClick={()=>navigate('/panier')}
            style={{color:cartCount>0?T.accent:T.muted}}>
            {cartCount>0&&<span className="nav-badge">{cartCount}</span>}
            <span style={{fontSize:20}}>🛒</span> Panier
          </button>
          <button className="nav-item" onClick={()=>navigate('/suivi')}>
            <span style={{fontSize:20}}>📍</span> Suivi
          </button>
          <button className="nav-item" onClick={()=>navigate('/suivi')}>
            <span style={{fontSize:20}}>⭐</span> Avis
          </button>
        </nav>

        {/* Modal plat */}
        {modal&&(
          <div className="modal-overlay" onClick={()=>setModal(null)}>
            <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
              <div style={{padding:20}}>
                {/* En-tête */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div>
                    <h2 style={{fontFamily:fontD,fontSize:20,color:T.text,marginBottom:2}}>{modal.name}</h2>
                    <p style={{color:T.muted,fontSize:12}}>{modal.category_name} · {modal.prep_time_minutes}min</p>
                  </div>
                  <button onClick={()=>setModal(null)} style={{background:T.surface,border:`1px solid ${T.border}`,
                    color:T.muted,borderRadius:8,padding:'5px 9px',cursor:'pointer',fontFamily:font}}>✕</button>
                </div>

                <p style={{color:T.sub,fontSize:13,lineHeight:1.6,marginBottom:14}}>{modal.description}</p>

                {/* Allergènes */}
                {modal.allergens?.length>0&&(
                  <div style={{marginBottom:14}}>
                    <p style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:7,
                      textTransform:'uppercase',letterSpacing:.6}}>Allergènes</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                      {modal.allergens.map(a=>(
                        <span key={a.id} style={{background:T.surface,border:`1px solid ${T.border}`,
                          borderRadius:20,padding:'3px 9px',fontSize:11,color:T.sub}}>
                          {a.icon} {a.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modifications */}
                <div style={{marginBottom:14}}>
                  <p style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:7,
                    textTransform:'uppercase',letterSpacing:.6}}>Personnaliser</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {MODS.map(m=>(
                      <span key={m} className={`mod-chip ${modal.selMods?.includes(m)?'sel':''}`}
                        onClick={()=>setModal(prev=>({...prev,
                          selMods: prev.selMods?.includes(m)
                            ? prev.selMods.filter(x=>x!==m)
                            : [...(prev.selMods||[]),m]
                        }))}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Note libre */}
                <div style={{marginBottom:18}}>
                  <p style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:6,
                    textTransform:'uppercase',letterSpacing:.6}}>Note au cuisinier</p>
                  <textarea className="field-ta" rows={2}
                    placeholder="Ex : sans carottes, sauce à part…"
                    value={modal.note||''}
                    onChange={e=>setModal(p=>({...p,note:e.target.value}))}/>
                </div>

                {/* Prix + Ajouter */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  borderTop:`1px solid ${T.border}`,paddingTop:14}}>
                  <div>
                    <p style={{color:T.accent,fontWeight:700,fontSize:20}}>
                      {Number(modal.price).toLocaleString('fr-FR')} FCFA
                    </p>
                    <Stars note={modal.note_moyenne} T={T}/>
                    <span style={{color:T.muted,fontSize:11,marginLeft:4}}>({modal.nb_avis||0} avis)</span>
                  </div>
                  <button className="add-btn-main" onClick={addFromModal}>
                    🛒 Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}