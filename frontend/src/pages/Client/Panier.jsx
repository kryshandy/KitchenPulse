/**
 * Panier.jsx — KitchenPulse
 * CORRECTIONS :
 *  - La table se pré-remplit automatiquement depuis user.table (AuthContext)
 *  - Si livraison → message spécifique, pas de sélection de table
 *  - Si sur place sans table assignée → select manuel (fallback)
 *  - t.numero → t.table_number (nom réel de la colonne)
 *  - Route /tables accessible personnel seulement → on utilise /tables/my pour le client
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

export default function Panier() {
  const { T }        = useTheme();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kp_cart') || '[]'); } catch { return []; }
  });

  // Table : pré-remplie depuis le profil utilisateur
  const [tableInfo,   setTableInfo]   = useState(null);   // { table_id, table_number, label }
  const [isDelivery,  setIsDelivery]  = useState(false);
  const [tableId,     setTableId]     = useState('');     // seulement si fallback manuel
  const [tableLoaded, setTableLoaded] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [msg,         setMsg]         = useState('');

  // ── Récupérer la table assignée au client ──
  useEffect(() => {
    // Essai 1 : table déjà dans le contexte auth (login)
    if (user?.table) {
      if (user.table.table_number === 0) {
        setIsDelivery(true);
      } else {
        setTableInfo(user.table);
        setTableId(String(user.table.table_id));
      }
      setTableLoaded(true);
      return;
    }

    // Essai 2 : appel API /tables/my
    api.get('/tables/my')
      .then(({ data }) => {
        if (data.delivery) {
          setIsDelivery(true);
        } else if (data.table) {
          setTableInfo(data.table);
          setTableId(String(data.table.table_id));
        }
      })
      .catch(() => {}) // non bloquant — le client pourra choisir manuellement
      .finally(() => setTableLoaded(true));
  }, [user]);

  // ── Sync panier ──
  useEffect(() => {
    localStorage.setItem('kp_cart', JSON.stringify(cart));
  }, [cart]);

  const changeQty = (plat_id, delta) => {
    setCart(prev => {
      const item = prev.find(i => i.plat_id === plat_id);
      if (!item) return prev;
      const nq = item.quantity + delta;
      if (nq <= 0) return prev.filter(i => i.plat_id !== plat_id);
      return prev.map(i => i.plat_id === plat_id ? { ...i, quantity: nq } : i);
    });
  };

  const remove = (plat_id) => setCart(prev => prev.filter(i => i.plat_id !== plat_id));

  const total = cart.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  const commander = async () => {
    if (!cart.length) return;
    if (!tableId && !isDelivery) { setMsg('Veuillez indiquer votre numéro de table'); return; }
    setLoading(true); setMsg('');
    try {
      const items = cart.map(i => ({
        plat_id:    i.plat_id,
        quantity:   i.quantity,
        unit_price: i.price,
      }));

      // Pour livraison : table_id = null → le backend utilisera automatiquement la table livraison (table_number=0)
      // Pour sur place : table_id = l'id réel de la table assignée
      const payload = {
        table_id: isDelivery ? null : (Number(tableId) || null),
        items,
      };

      const { data } = await api.post('/orders', payload);
      localStorage.removeItem('kp_cart');
      setCart([]);
      navigate(`/suivi/${data.commande_id}`);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ─────────────────────────────────────────────────
  const card = {
    background: T.card, border: `1.5px solid ${T.border}`,
    borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: T.shadow,
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 120 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>

          <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 6 }}>
            Mon panier
          </h1>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>
            {cart.length} article{cart.length > 1 ? 's' : ''}
          </p>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>Ton panier est vide</p>
              <button onClick={() => navigate('/menu')} style={{
                background: T.accent, color: '#0A0C10', border: 'none',
                borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: font,
              }}>Voir le menu</button>
            </div>
          ) : (
            <>
              {/* ── Articles ── */}
              {cart.map(item => (
                <div key={item.plat_id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                      {item.mods?.length > 0 && (
                        <p style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{item.mods.join(', ')}</p>
                      )}
                      {item.note && (
                        <p style={{ color: T.sub, fontSize: 11, marginTop: 2, fontStyle: 'italic' }}>
                          Note : {item.note}
                        </p>
                      )}
                    </div>
                    <button onClick={() => remove(item.plat_id)} style={{
                      background: 'transparent', border: 'none', color: T.muted,
                      cursor: 'pointer', fontSize: 16, padding: '0 4px',
                    }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: T.accent, fontWeight: 700, fontSize: 15 }}>
                      {(Number(item.price) * item.quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => changeQty(item.plat_id, -1)} style={qtyBtn(T)}>−</button>
                      <span style={{ color: T.text, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => changeQty(item.plat_id, +1)}
                        style={{ ...qtyBtn(T), background: T.accent, borderColor: T.accent, color: '#0A0C10' }}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* ── Total ── */}
              <div style={{ ...card, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: T.sub, fontSize: 13 }}>Sous-total</span>
                  <span style={{ color: T.text, fontWeight: 600 }}>{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={{ height: 1, background: T.border, marginBottom: 10 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span style={{ color: T.accent, fontWeight: 800, fontSize: 18 }}>
                    {total.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* ── Table / Livraison ── */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 11, color: T.muted, fontWeight: 700,
                  letterSpacing: .6, textTransform: 'uppercase', marginBottom: 8,
                }}>
                  Mode de service
                </label>

                {/* Chargement de la table en cours */}
                {!tableLoaded && (
                  <div style={{ color: T.muted, fontSize: 13 }}>Chargement de votre table…</div>
                )}

                {/* Livraison à domicile */}
                {tableLoaded && isDelivery && (
                  <div style={{
                    background: 'rgba(96,165,250,0.08)', border: '1.5px solid rgba(96,165,250,0.3)',
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <p style={{ color: '#60A5FA', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                      Livraison à domicile
                    </p>
                    <p style={{ color: T.muted, fontSize: 12 }}>
                      Votre commande sera livrée et vous serez appelé(e) au{' '}
                      <strong style={{ color: T.text }}>{user?.phone || 'votre numéro'}</strong>.
                    </p>
                  </div>
                )}

                {/* Table assignée automatiquement */}
                {tableLoaded && !isDelivery && tableInfo && (
                  <div style={{
                    background: 'rgba(232,96,28,0.08)', border: `1.5px solid ${T.accent}50`,
                    borderRadius: 12, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <p style={{ color: T.accent, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                        Table {tableInfo.table_number}
                        {tableInfo.label && tableInfo.label !== `Table ${tableInfo.table_number}`
                          ? ` — ${tableInfo.label}` : ''}
                      </p>
                      <p style={{ color: T.muted, fontSize: 12 }}>Assignée à votre compte</p>
                    </div>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}

                {/* Aucune table assignée → saisie manuelle */}
                {tableLoaded && !isDelivery && !tableInfo && (
                  <div>
                    <p style={{ color: T.muted, fontSize: 12, marginBottom: 8 }}>
                      Aucune table n'est assignée à votre compte. Entrez votre numéro de table.
                    </p>
                    <input
                      type="number"
                      min="1"
                      value={tableId}
                      onChange={e => setTableId(e.target.value)}
                      placeholder="ex. 5"
                      style={{
                        width: '100%', padding: '11px 12px',
                        background: T.surface, border: `1.5px solid ${T.border}`,
                        borderRadius: 10, color: T.text, fontFamily: font,
                        fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e  => e.target.style.borderColor = T.border}
                    />
                  </div>
                )}
              </div>

              {msg && (
                <p style={{ color: T.red, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{msg}</p>
              )}

              <button onClick={commander} disabled={loading || !cart.length} style={{
                width: '100%', padding: '14px',
                background: T.accent, color: '#0A0C10',
                border: 'none', borderRadius: 13,
                fontFamily: font, fontSize: 16, fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? .7 : 1, transition: 'opacity .2s',
              }}>
                {loading ? 'Envoi en cuisine…' : `Commander · ${total.toLocaleString('fr-FR')} FCFA`}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const qtyBtn = (T) => ({
  width: 30, height: 30, borderRadius: 8,
  border: `1.5px solid ${T.border}`, background: T.surface,
  color: T.text, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700,
});