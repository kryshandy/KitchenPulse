import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

const MODS = [
  'Pas épicé', 'Très épicé', 'Sans sel', 'Sans carottes', 'Sans oignons',
  'Sans tomates', 'Sauce à part', 'Bien cuit', 'Saignant', 'Sans poivre',
  'Extra sauce', 'Sans piment', 'Végétarien', 'Sans gluten',
];

const Stars = ({ note, size = 12, T }) => (
  <span>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize: size, color: i <= Math.round(note || 0) ? T.accent : T.muted }}>★</span>
    ))}
  </span>
);

export default function Menu() {
  const { user } = useAuth();
  const { T } = useTheme();
  const navigate = useNavigate();

  const [dishes,     setDishes]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart,       setCart]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('kp_cart') || '[]'); } catch { return []; }
  });
  const [activeCat, setActiveCat] = useState('');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);

  useEffect(() => {
    api.get('/dishes/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const loadDishes = useCallback(() => {
    setLoading(true);
    const p = {};
    if (activeCat) p.category = activeCat;
    if (search)    p.search   = search;
    api.get('/dishes', { params: p })
      .then(r => setDishes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCat, search]);

  useEffect(() => { loadDishes(); }, [loadDishes]);
  useEffect(() => { localStorage.setItem('kp_cart', JSON.stringify(cart)); }, [cart]);

  const getQty   = id => cart.find(i => i.plat_id === id)?.quantity || 0;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const userAllergies = user?.allergies || [];

  const changeQty = (dish, delta, e) => {
    e?.stopPropagation();
    setCart(prev => {
      const ex = prev.find(i => i.plat_id === dish.id);
      if (!ex && delta > 0) return [...prev, {
        plat_id: dish.id, quantity: 1, name: dish.name,
        price: Number(dish.price), mods: [], note: '',
      }];
      if (!ex) return prev;
      const nq = ex.quantity + delta;
      if (nq <= 0) return prev.filter(i => i.plat_id !== dish.id);
      return prev.map(i => i.plat_id === dish.id ? { ...i, quantity: nq } : i);
    });
  };

  const addFromModal = () => {
    const d = modal;
    setCart(prev => {
      const ex = prev.find(i => i.plat_id === d.id);
      const entry = {
        plat_id: d.id, quantity: (ex?.quantity || 0) + 1,
        name: d.name, price: Number(d.price),
        mods: d.selMods || [], note: d.customNote || '',
      };
      if (ex) return prev.map(i => i.plat_id === d.id ? entry : i);
      return [...prev, entry];
    });
    setModal(null);
  };

  return (
    <>
      <Navbar cartCount={cartCount} />

      <div style={{
        minHeight: '100vh', background: T.bg, fontFamily: font,
        paddingBottom: 80,
      }}>
        {/* Alerte allergies */}
        {userAllergies.length > 0 && (
          <div style={{
            background: T.isDark ? 'rgba(245,166,35,.07)' : '#FFF8ED',
            borderBottom: `1px solid rgba(245,166,35,.2)`,
            padding: '8px 18px', fontSize: 12, color: T.accent,
          }}>
            ⚠️ Tes allergies ({userAllergies.map(a => a.icon).join(' ')}) sont signalées sur les plats
          </div>
        )}

        {/* Barre de recherche */}
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center', color: T.muted, pointerEvents: 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un plat…"
              style={{
                width: '100%', background: T.surface, border: `1.5px solid ${T.border}`,
                borderRadius: 12, color: T.text, fontFamily: font, fontSize: 14,
                padding: '11px 14px 11px 40px', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e  => e.target.style.borderColor = T.border}
            />
          </div>
        </div>

        {/* Catégories */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${categories.length + 1}, 1fr)`,
          gap: 0,
          borderBottom: `1px solid ${T.border}`,
          marginTop: 14,
          overflowX: 'auto',
        }}>
          {[{ slug: '', name: 'Tout', icon: '🍽️' }, ...categories].map(c => {
            const active = activeCat === c.slug;
            return (
              <button key={c.slug || 'all'}
                onClick={() => setActiveCat(c.slug)}
                style={{
                  flex: 1, minWidth: 80, padding: '10px 6px',
                  background: active ? T.accent : T.surface,
                  border: 'none', borderBottom: active ? `3px solid ${T.accentDeep || T.accent}` : `3px solid transparent`,
                  cursor: 'pointer', fontFamily: font, fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#0A0C10' : T.sub,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'all .18s', whiteSpace: 'nowrap',
                }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Grille de plats */}
        <div style={{ padding: '14px 14px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{
                width: 32, height: 32,
                border: `3px solid ${T.border}`, borderTopColor: T.accent,
                borderRadius: '50%', animation: 'spin .8s linear infinite',
              }} />
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 12,
            }}>
              {dishes.length === 0 && (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: T.muted, padding: 40 }}>
                  Aucun plat trouvé
                </p>
              )}

              {dishes.map((dish, i) => {
                const warn = userAllergies.length &&
                  dish.allergens?.some(a => userAllergies.map(u => u.id).includes(a.id));
                const qty  = getQty(dish.id);

                return (
                  <div key={dish.id}
                    onClick={() => dish.is_active && setModal({ ...dish, selMods: [], customNote: '' })}
                    style={{
                      background: T.card, border: `1.5px solid ${T.border}`,
                      borderRadius: 16, overflow: 'hidden',
                      opacity: dish.is_active ? 1 : 0.45,
                      cursor: dish.is_active ? 'pointer' : 'not-allowed',
                      transition: 'all .2s', boxShadow: T.shadow,
                      animation: `fadeUp .3s ease ${i * .04}s both`,
                    }}
                    onMouseEnter={e => dish.is_active && (e.currentTarget.style.borderColor = T.accent)}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>

                    {/* Image */}
                    <div style={{
                      height: 120, background: T.surface, position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {dish.image_url
                        ? <img
                            src={dish.image_url}  
                            alt={dish.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        : <span style={{ fontSize: 46 }}>{dish.category_icon || '🍽️'}</span>
                      }
                      {dish.is_featured && (
                        <span style={{
                          position: 'absolute', top: 7, left: 7,
                          background: T.accent, color: '#0A0C10',
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        }}>⭐ TOP</span>
                      )}
                      {warn && (
                        <span style={{
                          position: 'absolute', top: 7, right: 7,
                          background: 'rgba(245,101,101,.92)', color: '#fff',
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        }}>⚠️ Allergie</span>
                      )}
                      {!dish.is_active && (
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(10,12,16,.65)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: T.muted, fontSize: 12, fontWeight: 600,
                        }}>Indisponible</div>
                      )}
                    </div>

                    <div style={{ padding: 12 }}>
                      <p style={{ color: T.text, fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                        {dish.name}
                      </p>
                      <p style={{
                        color: T.muted, fontSize: 11, lineHeight: 1.4, marginBottom: 7,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {dish.description}
                      </p>

                      {/* Allergènes */}
                      {dish.allergens?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                          {dish.allergens.slice(0, 2).map(a => (
                            <span key={a.id} style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              padding: '2px 6px', borderRadius: 8,
                              background: 'rgba(245,101,101,.1)',
                              border: '1px solid rgba(245,101,101,.2)',
                              color: '#fca5a5', fontSize: 10,
                            }}>{a.icon} {a.code}</span>
                          ))}
                          {dish.allergens.length > 2 && (
                            <span style={{
                              padding: '2px 6px', borderRadius: 8,
                              background: T.surface, border: `1px solid ${T.border}`,
                              color: T.muted, fontSize: 10,
                            }}>+{dish.allergens.length - 2}</span>
                          )}
                        </div>
                      )}

                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div>
                          <p style={{ color: T.accent, fontWeight: 700, fontSize: 15 }}>
                            {Number(dish.price).toLocaleString('fr-FR')} FCFA
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                            <Stars note={dish.note_moyenne} T={T} />
                            <span style={{ fontSize: 10, color: T.muted }}>({dish.nb_avis || 0})</span>
                          </div>
                        </div>

                        {/* Contrôle quantité direct */}
                        <div onClick={e => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {qty > 0 ? (
                            <>
                              <button onClick={e => changeQty(dish, -1, e)} style={qtyBtnStyle(T)}>−</button>
                              <span style={{ color: T.text, fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center' }}>
                                {qty}
                              </span>
                              <button onClick={e => changeQty(dish, +1, e)}
                                style={{ ...qtyBtnStyle(T), background: T.accent, borderColor: T.accent, color: '#0A0C10' }}>
                                +
                              </button>
                            </>
                          ) : (
                            <button onClick={e => changeQty(dish, +1, e)}
                              disabled={!dish.is_active}
                              style={{
                                ...qtyBtnStyle(T), width: 34, height: 34, fontSize: 20,
                                background: T.accent, borderColor: T.accent, color: '#0A0C10',
                              }}>+</button>
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
      </div>

      {/* Modal personnalisation plat */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 200,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 520,
              maxHeight: '88vh', overflowY: 'auto', animation: 'fadeUp .3s ease',
            }}>
            <div style={{ padding: '20px 20px 32px' }}>

              {/* Handle */}
              <div style={{ width: 40, height: 4, background: T.border, borderRadius: 2, margin: '0 auto 16px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontFamily: fontD, fontSize: 20, color: T.text, marginBottom: 2 }}>{modal.name}</h2>
                  <p style={{ color: T.muted, fontSize: 12 }}>
                    {modal.category_name}
                    {modal.prep_time_minutes ? ` · ⏱ ${modal.prep_time_minutes}min` : ''}
                  </p>
                </div>
                <button onClick={() => setModal(null)} style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  color: T.muted, borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                }}>✕</button>
              </div>

              <p style={{ color: T.sub, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{modal.description}</p>

              {/* Allergènes */}
              {modal.allergens?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .6 }}>Allergènes</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {modal.allergens.map(a => (
                      <span key={a.id} style={{
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 20, padding: '4px 10px', fontSize: 12, color: T.sub,
                      }}>{a.icon} {a.label}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Personnalisation */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .6 }}>
                  Personnaliser la composition
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {MODS.map(m => {
                    const sel = modal.selMods?.includes(m);
                    return (
                      <span key={m}
                        onClick={() => setModal(prev => ({
                          ...prev,
                          selMods: sel ? prev.selMods.filter(x => x !== m) : [...(prev.selMods || []), m],
                        }))}
                        style={{
                          padding: '6px 13px', borderRadius: 20, cursor: 'pointer',
                          fontSize: 12, fontFamily: font, transition: 'all .15s',
                          background: sel ? T.accentGlow : T.surface,
                          border: `1.5px solid ${sel ? T.accent : T.border}`,
                          color: sel ? T.accent : T.sub,
                        }}>
                        {sel ? '✓ ' : ''}{m}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Note libre */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .6 }}>Note au cuisinier</p>
                <textarea
                  value={modal.customNote || ''}
                  onChange={e => setModal(p => ({ ...p, customNote: e.target.value }))}
                  placeholder="Ex : sans carottes, très peu de sel…"
                  rows={2}
                  style={{
                    width: '100%', background: T.surface, border: `1.5px solid ${T.border}`,
                    borderRadius: 10, color: T.text, fontFamily: font, fontSize: 13,
                    padding: '10px 12px', outline: 'none', resize: 'vertical',
                  }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e  => e.target.style.borderColor = T.border}
                />
              </div>

              {/* Prix + bouton */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderTop: `1px solid ${T.border}`, paddingTop: 16,
              }}>
                <div>
                  <p style={{ color: T.accent, fontWeight: 700, fontSize: 22 }}>
                    {Number(modal.price).toLocaleString('fr-FR')} FCFA
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <Stars note={modal.note_moyenne} T={T} />
                    <span style={{ fontSize: 11, color: T.muted }}>({modal.nb_avis || 0} avis)</span>
                  </div>
                </div>
                <button onClick={addFromModal} style={{
                  background: T.accent, color: '#0A0C10', border: 'none',
                  borderRadius: 12, padding: '13px 22px', fontSize: 15,
                  fontWeight: 700, cursor: 'pointer', fontFamily: font,
                  transition: 'all .2s',
                }}>
                  🛒 Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const qtyBtnStyle = (T) => ({
  width: 30, height: 30, borderRadius: 8,
  border: `1.5px solid ${T.border}`, background: T.surface,
  color: T.text, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, transition: 'all .15s', fontFamily: font,
});