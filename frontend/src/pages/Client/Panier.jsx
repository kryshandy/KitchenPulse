import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

export default function Panier() {
  const { T } = useTheme();
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kp_cart') || '[]'); } catch { return []; }
  });
  const [tables,   setTables]   = useState([]);
  const [tableId,  setTableId]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState('');

  const [tablesErr, setTablesErr] = useState(false);

  useEffect(() => {
    api.get('/tables')
      .then(r => setTables(r.data))
      .catch(() => setTablesErr(true));
  }, []);

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
    if (!tableId) { setMsg('Veuillez choisir une table'); return; }
    setLoading(true); setMsg('');
    try {
      const items = cart.map(i => ({
        plat_id:    i.plat_id,
        quantity:   i.quantity,
        unit_price: i.price,
      }));
      const { data } = await api.post('/orders', { table_id: Number(tableId), items });
      localStorage.removeItem('kp_cart');
      setCart([]);
      navigate(`/suivi/${data.commande_id}`);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 120 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>

          <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 6 }}>
            Mon panier 🛒
          </h1>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>
            {cart.length} article{cart.length > 1 ? 's' : ''}
          </p>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🛒</div>
              <p style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>
                Ton panier est vide
              </p>
              <button onClick={() => navigate('/menu')} style={{
                background: T.accent, color: '#0A0C10', border: 'none',
                borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: font,
              }}>Voir le menu</button>
            </div>
          ) : (
            <>
              {/* Items */}
              {cart.map(item => (
                <div key={item.plat_id} style={{
                  background: T.card, border: `1.5px solid ${T.border}`,
                  borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: T.shadow,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                      {item.mods?.length > 0 && (
                        <p style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>
                          {item.mods.join(', ')}
                        </p>
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
                      <button onClick={() => changeQty(item.plat_id, +1)} style={{ ...qtyBtn(T), background: T.accent, borderColor: T.accent, color: '#0A0C10' }}>+</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div style={{
                background: T.card, border: `1.5px solid ${T.border}`,
                borderRadius: 14, padding: 16, marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: T.sub, fontSize: 13 }}>Sous-total</span>
                  <span style={{ color: T.text, fontWeight: 600 }}>{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={{ height: 1, background: T.border, marginBottom: 10 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span style={{ color: T.accent, fontWeight: 800, fontSize: 18 }}>{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Choix de table */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', marginBottom: 8 }}>
                  Table <span style={{ color: T.accent }}>*</span>
                </label>
                <select value={tableId} onChange={e => setTableId(e.target.value)} style={{
                  width: '100%', padding: '11px 12px',
                  background: T.surface, border: `1.5px solid ${T.border}`,
                  borderRadius: 10, color: tableId ? T.text : T.muted,
                  fontFamily: font, fontSize: 13, outline: 'none',
                }}>
                  <option value="">Choisir une table…</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.label || `Table ${t.table_number}`}</option>
                  ))}
                </select>
              </div>

              {tablesErr && (
                <p style={{ fontSize: 11, color: T.red, marginTop: 6 }}>
                  ⚠️ Impossible de charger les tables — vérifiez que le backend tourne
                </p>
              )}
              {!tablesErr && tables.length === 0 && (
                <p style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                  Chargement des tables…
                </p>
              )}

              {msg && (
                <p style={{ color: T.red, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{msg}</p>
              )}

              <button onClick={commander} disabled={loading || !cart.length} style={{
                width: '100%', padding: '14px', background: T.accent,
                color: '#0A0C10', border: 'none', borderRadius: 13,
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